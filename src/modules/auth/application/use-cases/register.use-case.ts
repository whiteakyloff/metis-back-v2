import { Inject, Service } from "typedi";

import { Result } from "@shared/infrastructure/core/result";

import { User } from "../../domain/models/impl.user.model";
import { VerificationCode } from "../../domain/models/impl.verification.model";

import { RegisterDTO } from "../../domain/dto/register.dto";
import { AuthResponseDTO } from "../../domain/dto/auth-response.dto";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { ILogger } from "@shared/domain/services/impl.logger.service";
import { IHasher } from "@shared/domain/services/impl.hasher.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";
import { ITokenService } from "../../domain/services/impl.token.service";
import { IVerificationService } from "../../domain/services/impl.verification.service";

@Service()
export class RegisterUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('hasherService')
        private readonly hasherService: IHasher,
        @Inject('userRepository')
        private readonly userRepository: BaseRepository<User>,
        @Inject('tokenService')
        private readonly tokenService: ITokenService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('verificationRepository')
        private readonly verificationRepository: BaseRepository<VerificationCode>,
        @Inject('verificationService')
        private readonly verificationService: IVerificationService,
    ) {}

    async execute(input: RegisterDTO): Promise<Result<AuthResponseDTO>> {
        try {
            const existingUser = await this.userRepository.findBy({
                email: input.email
            });
            if (existingUser) {
                return Result.failure(
                    this.localizationService.getTextById('USER_ALREADY_EXISTS')
                );
            }
            const password = await this.hasherService.hash(input.password);

            const user = User.create({
                email: input.email,
                username: input.username || input.email.split('@')[0], password
            });
            await this.userRepository.save(user);

            const verificationResult = await this.verificationService.createVerificationCode({
                email: user.email, verificationType: 'REGISTER'
            });
            if (!verificationResult.isSuccess()) {
                await this.userRepository.deleteBy({
                    email: user.email
                });
                return Result.failure(verificationResult.getError());
            }
            try {
                const token = await this.tokenService.generateToken(
                    { email: user.email, userId: user.id }
                )
                return Result.success(new AuthResponseDTO(
                    token, this.localizationService.getTextById('REGISTRATION_SUCCESSFUL'), {
                        id: user.id, email: user.email, username: user.username
                    }
                ))
            } catch (emailError) {
                await this.userRepository.deleteBy({ email: user.email });
                await this.verificationRepository.deleteBy({ email: user.email });

                this.logger.error('Failed to send verification email:', { emailError });
                return Result.failure(this.localizationService.getTextById('VERIFICATION_EMAIL_SENDING_FAILED'));
            }
        } catch (error) {
            this.logger.error('Registration failed ', { error, email: input.email });
            return Result.failure(this.localizationService.getTextById('REGISTRATION_FAILED'));
        }
    }
}