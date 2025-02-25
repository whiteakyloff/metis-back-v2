import { Inject, Service } from "typedi";
import { Result } from "@infrastructure/core/result";

import { RecoveryDTO } from "@domain/dto/auth/recovery.dto";

import { ILogger } from "@domain/services/impl.logger.service";
import { IUserRepository } from "@domain/repositories/impl.user.repository";
import { IPasswordHasher } from "@domain/services/impl.hasher.service";
import { ILocalizationService } from "@domain/services/impl.localization.service";

@Service()
export class RecoveryUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('passwordHasher')
        private readonly passwordHasher: IPasswordHasher,
        @Inject('userRepository')
        private readonly userRepository: IUserRepository,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
    ) {}

    async execute(input: RecoveryDTO): Promise<Result<String>> {
        try {
            const user = await this.userRepository.findByEmail(input.email);

            if (!user) {
                return Result.failure(
                    this.localizationService.getTextById('USER_NOT_FOUND', { email: input.email })
                );
            }
            if (user.authMethod == 'google') {
                return Result.failure(
                    this.localizationService.getTextById('GOOGLE_ACCOUNT_CANNOT_RECOVER')
                );
            }
            const hashedPassword = await this.passwordHasher.hash(input.password);
            await this.userRepository.updateByEmail(input.email, { password: hashedPassword });

            return Result.success(this.localizationService.getTextById('PASSWORD_RECOVERY_SUCCESSFUL'));
        } catch (error) {
            this.logger.error("Recovery failed", { error });
            return Result.failure(this.localizationService.getTextById('RECOVERY_FAILED'));
        }
    }
}