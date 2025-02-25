import { Inject, Service } from "typedi";
import { Result } from "@infrastructure/core/result";

import {SendVerifyEmailDTO, VerifyEmailDTO} from "@domain/dto/auth/verify-email.dto";
import { VerificationCode } from "@domain/models/impl.verification.model";

import { IMailService } from "@domain/services/impl.mail.service";
import { ILocalizationService } from "@domain/services/impl.localization.service";
import { IUserRepository } from "@domain/repositories/impl.user.repository";
import { IVerificationRepository } from "@domain/repositories/impl.verification.repository";
import { IVerificationService } from "@domain/services/impl.verification.service";

@Service()
export class VerificationService implements IVerificationService {
    constructor(
        @Inject('verificationRepository')
        private readonly verificationRepository: IVerificationRepository,
        @Inject('userRepository')
        private readonly userRepository: IUserRepository,
        @Inject('mailService')
        private readonly mailService: IMailService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService
    ) {}

    async createVerificationCode(data: SendVerifyEmailDTO): Promise<Result<string>> {
        const { email, verificationType } = data;
        const user = await this.userRepository.findByEmail(email);
        let verificationRecord = await this.verificationRepository.findByEmail(email);

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
            await this.verificationRepository.update(email, updatedRecord);
            this.mailService.sendVerificationEmail(email, verificationRecord.verificationCode!);

            return Result.success(this.localizationService.getTextById('VERIFICATION_CODE_RECREATED', {
                attemptsCount: (3 - updatedRecord.attemptsCount).toString(),
            }));
        }
    }

    async verifyEmail(data: VerifyEmailDTO): Promise<Result<string>> {
        const { email, verificationCode, verificationType } = data;
        const user = await this.userRepository.findByEmail(email);
        const verificationRecord = await this.verificationRepository.findByEmail(email);

        if (!user) {
            return Result.failure(
                this.localizationService.getTextById('USER_NOT_FOUND', { email })
            );
        }
        if (verificationType == 'REGISTER' && user.emailVerified) {
            return Result.failure(
                this.localizationService.getTextById('EMAIL_ALREADY_VERIFIED')
            );
        }
        if (!verificationRecord || !verificationRecord.verificationCode) {
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
        await this.userRepository.updateByEmail(email, { emailVerified: true });
        await this.verificationRepository.delete(email);

        return Result.success(
            this.localizationService.getTextById('EMAIL_VERIFIED')
        )
    }
}