import { Inject, Service } from "typedi";

import { Result } from "@shared/infrastructure/core/result";

import { User } from "../../domain/models/impl.user.model";

import { LoginDTO } from "../../domain/dto/login.dto";
import { AuthResponseDTO } from "../../domain/dto/auth-response.dto";

import { BaseAuthClient } from "@shared/domain/clients/base.client";
import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { ILogger } from "@shared/domain/services/impl.logger.service";
import { IHasher } from "@shared/domain/services/impl.hasher.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";
import { ITokenService } from "../../domain/services/impl.token.service";

import { ClientRegistry } from "@shared/domain/clients/client.registry";

@Service()
export class LoginUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('hasher')
        private readonly hasher: IHasher,
        @Inject('userRepository')
        private readonly userRepository: BaseRepository<User>,
        @Inject('tokenService')
        private readonly tokenService: ITokenService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('clientRegistry')
        private readonly clientRegistry: ClientRegistry
    ) {}

    async execute(input: LoginDTO): Promise<Result<AuthResponseDTO>> {
        try {
            const user = await this.userRepository.findBy({
                email: input.email
            });
            if (!user) {
                return Result.failure(
                    this.localizationService.getTextById('USER_NOT_FOUND', {
                        email: input.email
                    })
                );
            }
            const isPasswordValid = await this.hasher.compare(
                input.password, user.password
            );

            if (!isPasswordValid) {
                return Result.failure(
                    this.localizationService.getTextById('WRONG_PASSWORD')
                );
            }
            const token = await this.tokenService.generateToken(
                { email: user.email, userId: user.id }
            )
            return Result.success(new AuthResponseDTO(
                token, this.localizationService.getTextById('LOGIN_SUCCESSFUL'), {
                    id: user.id, email: user.email, username: user.username
                }
            ))
        } catch (error) {
            this.logger.error("Login failed", {
                error, email: input.email
            });
            return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
        }
    }

    async executeWithThirdParty(body: { access_token: string }, clientName: string): Promise<Result<AuthResponseDTO>> {
        try {
            const client = this.clientRegistry.getClient(clientName) as BaseAuthClient<any>;

            if (!client) {
                return Result.failure(
                    this.localizationService.getTextById('AUTH_CLIENT_NOT_FOUND', { clientName })
                );
            }
            const payload = await client.verifyToken(body.access_token);

            if (!payload || !payload.isSuccess()) {
                return Result.failure(payload.getError());
            }
            const { email } = payload.getValue();
            let user = await this.userRepository.findBy({ email });

            if (!user) {
                user = User.create({
                    email,
                    username: email.split('@')[0],
                    emailVerified: true,
                    authMethod: "third-party"
                });
                await this.userRepository.save(user);
            }
            const jwtToken = await this.tokenService.generateToken({
                email: user.email, userId: user.id
            });

            return Result.success(new AuthResponseDTO(jwtToken,
                this.localizationService.getTextById('LOGIN_SUCCESSFUL'),
                { id: user.id, email: user.email, username: user.username }
            ));
        } catch (error) {
            this.logger.error("Third-party login failed", {
                error, client: clientName
            });
            return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
        }
    }
}