import { Inject, Service } from "typedi";

import { IUserRepository } from "@domain/repositories/impl.user.repository";
import { IPasswordHasher } from "@domain/services/impl.hasher.service";
import { IMailService } from "@domain/services/impl.mail.service";
import { ILogger } from "@domain/services/impl.logger.service";
import { Result } from "@infrastructure/core/result";
import { User } from "@domain/models/impl.user.model";
import type { RegisterDTO } from "@domain/dto/auth/register.dto";
import { ILocalizationService } from "@domain/services/impl.localization.service";

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
    ) {}

    async execute(input: RegisterDTO): Promise<Result<string>> {
        try {
            const existingUser = await this.userRepository.findByEmail(input.email);

            if (existingUser) {
                return Result.failure(this.localizationService.getTextById('USER_ALREADY_EXISTS'));
            }
            const hashedPassword = await this.passwordHasher.hash(input.password);

            const user = User.create({
                email: input.email, username: input.username || input.email.split('@')[0], password: hashedPassword
            });
            await this.userRepository.save(user);

            // verification code system.
            await this.mailService.sendVerificationEmail(user.email, '123456');

            return Result.success(this.localizationService.getTextById('REGISTRATION_SUCCESSFUL'));
        } catch (error) {
            this.logger.error('Registration failed', {error});
            return Result.failure(this.localizationService.getTextById('REGISTRATION_FAILED'));
        }
    }
}