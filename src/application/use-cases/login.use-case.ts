import { Inject, Service } from "typedi";
import { Result } from "@infrastructure/core/result";

import { User } from "@domain/models/impl.user.model";
import { LoginDTO } from "@domain/dto/auth/login.dto";
import { ResponseDTO } from "@domain/dto/auth/response.dto";
import { GoogleClient } from "@infrastructure/clients/google.client";

import { BaseRepository } from "@domain/repositories/base.repository";
import { ILogger } from "@domain/services/impl.logger.service";
import { IPasswordHasher } from "@domain/services/impl.hasher.service";
import { ITokenService } from "@domain/services/impl.token.service";
import { ILocalizationService } from "@domain/services/impl.localization.service";

@Service()
export class LoginUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('userRepository')
        private readonly userRepository: BaseRepository<User>,
        @Inject('passwordHasher')
        private readonly passwordHasher: IPasswordHasher,
        @Inject('googleClient')
        private readonly googleClient: GoogleClient,
        @Inject('tokenService')
        private readonly tokenService: ITokenService,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService
    ) {}

    async execute(input: LoginDTO): Promise<Result<ResponseDTO>> {
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
            const isPasswordValid = await this.passwordHasher.compare(
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
            return Result.success(new ResponseDTO(
                token, this.localizationService.getTextById('LOGIN_SUCCESSFUL'), {
                    id: user.id, email: user.email, username: user.username
                }
            ))
        } catch (error) {
            this.logger.error("Login failed", { error }); return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
        }
    }

    async executeWithGoogle(body: { access_token: string }): Promise<Result<ResponseDTO>> {
        try {
            const client = this.googleClient.getClient();
            const payload = (await client.verifyIdToken({
                idToken: body.access_token,
                audience: client._clientId
            })).getPayload();

            if (!payload) {
                return Result.failure(this.localizationService.getTextById('GOOGLE_AUTH_FAILED'));
            }
            let user = await this.userRepository.findBy({
                email: payload.email!
            });

            if (!user) {
                user = User.create({
                    email: payload.email!,
                    username: payload.email!.split('@')[0],
                    emailVerified: true, authMethod: "google"
                });
                await this.userRepository.save(user);
            }
            const token = await this.tokenService.generateToken(
                { email: user.email, userId: user.id }
            )

            return Result.success(new ResponseDTO(
                token, this.localizationService.getTextById('LOGIN_SUCCESSFUL'), {
                    id: user.id, email: user.email, username: user.username
                }
            ))
        } catch (error) {
            this.logger.error("Login failed", { error }); return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
        }
    }
}