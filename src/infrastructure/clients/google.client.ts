import { Inject, Service } from "typedi";
import { OAuth2Client } from "google-auth-library";

import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";
import { IClient } from "@domain/clients/impl.client";
import { ILogger } from "@domain/services/impl.logger.service";

@Service()
export class GoogleClient implements IClient {
    private client: OAuth2Client | null = null;

    constructor(
        @Inject('Logger')
        private readonly logger: ILogger,
        @Inject('config')
        private readonly config: AppConfig
    ) {}

    public getClient(): OAuth2Client {
        if (!this.client) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Google Client not connected', 400);
        }
        return this.client;
    }

    async connect(): Promise<void> {
        try {
            const { clientId, clientSecret } = this.config.google;

            this.client = new OAuth2Client(clientId, clientSecret);
            this.logger.info('Google Client connected successfully.');
        } catch (error) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Error connecting to Google Client', 400);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.revokeCredentials(); this.client = null;
            }
            this.logger.info('Google Client disconnected successfully.');
        } catch (error) {
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Error disconnecting from Google Client', 400);
        }
    }
}