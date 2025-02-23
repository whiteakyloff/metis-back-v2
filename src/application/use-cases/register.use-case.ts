import { Inject, Service } from "typedi";

import { IUserRepository } from "@domain/repositories/impl.user.repository";
import { IPasswordHasher } from "@domain/services/impl.hasher.service";
import { IMailService } from "@domain/services/impl.mail.service";
import { ILogger } from "@domain/services/impl.logger.service";
import { Result } from "@infrastructure/core/result";
import { User } from "@domain/models/impl.user.model";
import type { RegisterDTO } from "@domain/dto/auth/register.dto";
import { ILocalizationService } from "@domain/services/impl.localization.service";
import { IVerificationService } from "@domain/services/impl.verification.service";
import {IVerificationRepository} from "@domain/repositories/impl.verification.repository";

@Service()
export class RegisterUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('mailService')
        private readonly mailService: IMailService,
        @Inject('userRepository')
        private readonly userRepository: IUserRepository,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('passwordHasher')
        private readonly passwordHasher: IPasswordHasher,
        @Inject('verificationService')
        private readonly verificationService: IVerificationService,
        @Inject('verificationRepository')
        private readonly verificationRepository: IVerificationRepository
    ) {}

    async execute(input: RegisterDTO): Promise<Result<string>> {
        try {
            const existingUser = await this.userRepository.findByEmail(input.email);

            if (existingUser) {
                return Result.failure(
                    this.localizationService.getTextById('USER_ALREADY_EXISTS')
                );
            }
            const password = await this.passwordHasher.hash(input.password);

            const user = User.create({
                email: input.email, username: input.username || input.email.split('@')[0], password
            });
            const verificationResult = await this.verificationService.createVerificationCode(user.email);

            if (!verificationResult.isSuccess()) {
                return Result.failure(verificationResult.getError());
            }
            await this.userRepository.save(user);

            try {
                await this.mailService.sendVerificationEmail(user.email, verificationResult.getValue().code);

                return Result.success(
                    this.localizationService.getTextById('REGISTRATION_SUCCESSFUL')
                );
            } catch (emailError) {
                await this.userRepository.delete(user.email);
                await this.verificationRepository.delete(user.email);

                this.logger.error('Failed to send verification email:', { emailError });
                return Result.failure(
                    this.localizationService.getTextById('VERIFICATION_EMAIL_SENDING_FAILED')
                );
            }
        } catch (error) {
            this.logger.error('Registration failed ', { error });
            return Result.failure(this.localizationService.getTextById('REGISTRATION_FAILED'));
        }
    }
}