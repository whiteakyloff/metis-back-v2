import { Inject, Service } from "typedi";
import { Result } from "@infrastructure/core/result";

import { User } from "@domain/models/impl.user.model";
import { RegisterDTO } from "@domain/dto/auth/register.dto";
import { ResponseDTO } from "@domain/dto/auth/response.dto";

import { ILogger } from "@domain/services/impl.logger.service";
import { IUserRepository } from "@domain/repositories/impl.user.repository";
import { IPasswordHasher } from "@domain/services/impl.hasher.service";
import { ITokenService } from "@domain/services/impl.token.service";
import { ILocalizationService } from "@domain/services/impl.localization.service";
import { IVerificationService } from "@domain/services/impl.verification.service";
import { IVerificationRepository } from "@domain/repositories/impl.verification.repository";

@Service()
export class RegisterUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('userRepository')
        private readonly userRepository: IUserRepository,
        @Inject('tokenService')
        private readonly tokenService: ITokenService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('passwordHasher')
        private readonly passwordHasher: IPasswordHasher,
        @Inject('verificationService')
        private readonly verificationService: IVerificationService,
        @Inject('verificationRepository')
        private readonly verificationRepository: IVerificationRepository
    ) {}

    async execute(input: RegisterDTO): Promise<Result<ResponseDTO>> {
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
            await this.userRepository.save(user);

            const verificationResult = await this.verificationService.createVerificationCode({
                email: user.email, verificationType: 'REGISTER'
            });
            if (!verificationResult.isSuccess()) {
                await this.userRepository.deleteByEmail(user.email);
                return Result.failure(verificationResult.getError());
            }
            try {
                const token = await this.tokenService.generateToken(
                    { email: user.email, userId: user.id }
                )
                return Result.success(new ResponseDTO(
                    token, this.localizationService.getTextById('REGISTRATION_SUCCESSFUL'), {
                        id: user.id, email: user.email, username: user.username
                    }
                ))
            } catch (emailError) {
                await this.userRepository.deleteByEmail(user.email);
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