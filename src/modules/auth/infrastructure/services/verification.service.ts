import { Inject, Service } from "typedi";

import { Result } from "@shared/infrastructure/core/result";

import { User } from "../../domain/models/impl.user.model";
import { VerificationCode } from "../../domain/models/impl.verification.model";
import { Recovery } from "@modules/auth/domain/models/impl.recovery.model";

import { SendVerifyEmailDTO, VerifyEmailDTO } from "../../domain/dto/verify-email.dto";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";
import { IMailService } from "../../domain/services/impl.mail.service";
import { IVerificationService } from "../../domain/services/impl.verification.service";
import {RecoveryResponseDTO} from "@modules/auth/domain/dto/recovery.dto";

@Service()
export class VerificationService implements IVerificationService {
    constructor(
        @Inject('userRepository')
        private readonly userRepository: BaseRepository<User>,
        @Inject('verificationRepository')
        private readonly verificationRepository: BaseRepository<VerificationCode>,
        @Inject('recoveryRepository')
        private readonly recoveryRepository: BaseRepository<Recovery>,
        @Inject('mailService')
        private readonly mailService: IMailService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService
    ) {}

    async createVerificationCode(data: SendVerifyEmailDTO): Promise<Result<string>> {
        const { email, verificationType } = data;

        const user = await this.userRepository.findBy({
            email
        });
        let verificationRecord = await this.verificationRepository.findBy({
            email
        });
        if (!user) {
            return Result.failure(
                this.localizationService.getTextById('USER_NOT_FOUND', { email})
            );
        }
        if (verificationType == 'REGISTER' && user.emailVerified) {
            return Result.failure(
                this.localizationService.getTextById('EMAIL_ALREADY_VERIFIED')
            );
        }

        if (!verificationRecord) {
            verificationRecord = VerificationCode.create(email);
            await this.verificationRepository.save(verificationRecord);
            this.mailService.sendVerificationEmail(email, verificationRecord.verificationCode!);

            return Result.success(this.localizationService.getTextById('VERIFICATION_CODE_CREATED'));
        } else {
            if (verificationRecord.attemptsCount >= 3 && !verificationRecord.isExpired()) {
                return Result.failure(
                    this.localizationService.getTextById('TOO_MANY_VERIFICATION_ATTEMPTS', {
                        remainingTime: verificationRecord.getRemainingTime()?.toString()!
                    })
                );
            }
            const updatedRecord = verificationRecord.attemptsCount >= 3
                ? VerificationCode.create(email)
                : verificationRecord.update();
            await this.verificationRepository.updateBy({ email }, updatedRecord);
            this.mailService.sendVerificationEmail(email, verificationRecord.verificationCode!);

            return Result.success(this.localizationService.getTextById('VERIFICATION_CODE_RECREATED', {
                attemptsCount: (3 - updatedRecord.attemptsCount).toString(),
            }));
        }
    }

    async verifyEmail(body: VerifyEmailDTO): Promise<Result<string | RecoveryResponseDTO>> {
        const { email, verificationCode, verificationType } = body;
        const [ user, verificationRecord ] = await Promise.all([
            this.userRepository.findBy({ email }),
            this.verificationRepository.findBy({ email })
        ]);

        if (!user) {
            return Result.failure(
                this.localizationService.getTextById('USER_NOT_FOUND', { email })
            );
        }
        if (verificationType === 'REGISTER' && user.emailVerified) {
            return Result.failure(
                this.localizationService.getTextById('EMAIL_ALREADY_VERIFIED')
            );
        }
        if (!verificationRecord?.verificationCode) {
            return Result.failure(
                this.localizationService.getTextById('VERIFICATION_NOT_FOUND')
            );
        }
        if (verificationRecord.verificationCode !== verificationCode) {
            return Result.failure(
                this.localizationService.getTextById('INVALID_VERIFICATION_CODE')
            );
        }
        if (verificationRecord.isExpired()) {
            return Result.failure(
                this.localizationService.getTextById('VERIFICATION_CODE_EXPIRED')
            );
        }
        await Promise.all([
            this.verificationRepository.deleteBy({ email }),
            this.userRepository.updateBy({ email }, { emailVerified: true })
        ]);

        if (verificationType === 'RECOVERY') {
            const recoveryKey = crypto.randomUUID();

            await this.recoveryRepository.save(Recovery.create({
                email, recoveryKey
            }));
            return Result.success(new RecoveryResponseDTO(
                this.localizationService.getTextById('EMAIL_VERIFIED'), recoveryKey
            ));
        }
        return Result.success(
            this.localizationService.getTextById('EMAIL_VERIFIED')
        );
    }
}