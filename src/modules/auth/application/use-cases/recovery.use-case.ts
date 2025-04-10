import { Inject, Service } from "typedi";

import { Result } from "@shared/infrastructure/core/result";

import { User } from "../../domain/models/impl.user.model";
import { Recovery } from "@modules/auth/domain/models/impl.recovery.model";

import { RecoveryDTO } from "../../domain/dto/recovery.dto";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { ILogger } from "@shared/domain/services/impl.logger.service";
import { IHasher } from "@shared/domain/services/impl.hasher.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

@Service()
export class RecoveryUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('hasher')
        private readonly hasher: IHasher,
        @Inject('userRepository')
        private readonly userRepository: BaseRepository<User>,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('recoveryRepository')
        private readonly recoveryRepository: BaseRepository<Recovery>,
    ) {}

    // todo: recovery only with special token
    async execute(input: RecoveryDTO, recoveryKey: string): Promise<Result<String>> {
        try {
            const user = await this.userRepository.findBy({
                email: input.email
            });

            if (!user) {
                return Result.failure(
                    this.localizationService.getTextById('USER_NOT_FOUND', { email: input.email })
                );
            }
            const recovery = await this.recoveryRepository.findBy({
                email: input.email
            });

            if (!recovery || recovery.recoveryKey !== recoveryKey) {
                return Result.failure(
                    this.localizationService.getTextById('RECOVERY_KEY_NOT_MATCH')
                );
            }
            if (!user.password) {
                return Result.failure(
                    this.localizationService.getTextById('THIRD_PARTY_ACCOUNT_CANNOT_RECOVER')
                );
            }
            const hashedPassword = await this.hasher.hash(input.password);
            await this.userRepository.updateBy({ email: input.email }, { password: hashedPassword });

            return Result.success(this.localizationService.getTextById('PASSWORD_RECOVERY_SUCCESSFUL'));
        } catch (error) {
            this.logger.error("Recovery failed", {
                error, email: input.email
            });
            return Result.failure(this.localizationService.getTextById('RECOVERY_FAILED'));
        }
    }
}