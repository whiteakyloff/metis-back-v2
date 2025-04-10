import { Inject, Service } from "typedi";
import appleSignin from "apple-signin-auth";
import { Result } from "@shared/infrastructure/core/result";

import { AppConfig } from "@config";
import { AppError } from "@shared/infrastructure/errors/app.error";
import { BaseAuthClient } from "@shared/domain/clients/base.client";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

@Service()
export class AppleClient extends BaseAuthClient<typeof appleSignin> {
    private client: typeof appleSignin | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService
    ) { super() }

    public getBase(): typeof appleSignin {
        if (!this.client) {
            throw new AppError('APPLE_CLIENT_ERROR', 'Apple Client not connected', 400);
        }
        return this.client;
    }

    async connect(): Promise<void> {
        try {
            this.client = appleSignin;
        } catch (error) {
            throw new AppError('APPLE_CLIENT_ERROR', 'Error connecting to Apple Client', 400);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                this.client = null;
            }
        } catch (error) {
            throw new AppError('APPLE_CLIENT_ERROR', `Error disconnecting from Apple Client: ${(error as Error).message}`, 400);
        }
    }

    async verifyToken(token: string): Promise<Result<any>> {
        if (!this.client) {
            throw new AppError('APPLE_CLIENT_ERROR', 'Apple Client not connected', 400);
        }
        try {
            const response = await this.client.verifyIdToken(
                token,
                { clientId: this.config.apple.clientId }
            );
            return Result.success({
                email: response.email, sub: response.sub
            });
        } catch (error) {
            return Result.failure(this.localizationService.getTextById("APPLE_AUTH_FAILED"));
        }
    }
}