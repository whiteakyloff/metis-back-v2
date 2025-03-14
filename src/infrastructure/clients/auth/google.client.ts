import { OAuth2Client } from 'google-auth-library';
import { Inject, Service } from "typedi";

import { BaseClient } from "@domain/clients/impl.client";
import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";

@Service()
export class GoogleClient extends BaseClient<OAuth2Client> {
    private client: OAuth2Client | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig
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
            throw new AppError('GOOGLE_CLIENT_ERROR', 'Error connecting to Google Client', 400);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                /* await this.client.revokeCredentials(); */ this.client = null;
            }
        } catch (error) {
            throw new AppError('GOOGLE_CLIENT_ERROR', `Error disconnecting from Google Client: ${(error as Error).message}`, 400);
        }
    }
}