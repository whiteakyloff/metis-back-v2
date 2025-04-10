import { OAuth2Client } from 'google-auth-library';
import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";
import { AppConfig } from "@config";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { BaseAuthClient } from "@shared/domain/clients/base.client";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

@Service()
export class GoogleClient extends BaseAuthClient<OAuth2Client> {
    private client: OAuth2Client | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
    ) { super() }

    public getBase(): OAuth2Client {
        if (!this.client) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Google Client not connected', 400);
        }
        return this.client;
    }

    async connect(): Promise<void> {
        try {
            const { clientId, clientSecret } = this.config.google;

            this.client = new OAuth2Client(clientId, clientSecret);
        } catch (error) {
            console.log(error);
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Error connecting to Google Client', 400);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                this.client = null;
            }
        } catch (error) {
            throw new AppError('GOOGLE_CLIENT_ERROR', `Error disconnecting from Google Client: ${(error as Error).message}`, 400);
        }
    }

    async verifyToken(token: string): Promise<Result<any>> {
        if (!this.client) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Google Client not connected', 400);
        }
        try {
            const payload = (await this.client.verifyIdToken({
                idToken: token,
                audience: this.client._clientId
            })).getPayload();

            if (!payload) {
                return Result.failure(this.localizationService.getTextById("GOOGLE_AUTH_FAILED"));
            }
            return Result.success(payload);
        } catch (error) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Error verifying Google token', 400);
        }
    }
}