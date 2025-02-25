import 'reflect-metadata';

import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { config } from "@config";

import { Server } from "socket.io";
import { Container } from "typedi";
import { useContainer } from "routing-controllers";
import { setupContainer } from "@infrastructure/container";
import { errorHandler } from "@presentation/middlewares/error.middleware";

import { IClient } from "@domain/clients/impl.client";
import { ILogger } from "@domain/services/impl.logger.service";

export class App {
    private readonly port: number;
    private readonly logger: ILogger;
    private readonly io: Server;
    public readonly expressApp: express.Application;

    constructor() {
        this.expressApp = express();
        setupContainer();
        useContainer(Container);

        this.port = config.port;
        this.logger = Container.get('logger');
        this.io = Container.get('socket.io');

        this.setupMiddlewares();
        this.setupErrorHandling();
    }

    public async start(): Promise<void> {
        try {
            await this.connectToDatabase();
            await this.setupRoutes();
            await this.startClients();

            const httpServer = this.expressApp.listen(this.port, () => {
                this.logger.info(`Server is running on port ${config.port}`);
                this.logger.info(`Environment: ${config.nodeEnv}`);
                this.logger.info(`Started at: ${new Date().toISOString()}`);
            });
            this.io.attach(httpServer);
            process.on('SIGINT', this.gracefulShutdown.bind(this));
            process.on('SIGTERM', this.gracefulShutdown.bind(this));
        } catch (error) {
            this.logger.error('Error starting server', { error });
            process.exit(1);
        }
    }

    private setupErrorHandling(): void {
        this.expressApp.use(errorHandler);
    }

    private setupMiddlewares(): void {
        // Спочатку cors
        this.expressApp.use(cors({
            origin: config.corsOrigin,
            credentials: true
        }));

        // Потім compression
        this.expressApp.use(compression());

        // Потім helmet
        this.expressApp.use(helmet());

        // Потім rate limiter
        /* const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 100
        });
        this.expressApp.use(limiter); */
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.mongodbUri);
            this.logger.info('Successfully connected to MongoDB');
        } catch (error) {
            this.logger.error('Error connecting to MongoDB', { error });
            process.exit(1);
        }
    }

    private async setupRoutes(): Promise<void> {
        const { appRoutes } = await import('@presentation/routes/app.routes');

        appRoutes.setup(this.expressApp);
    }

    private async startClients(): Promise<void> {
        try {
            const clients = {
                GoogleClient: Container.get<IClient>('googleClient'),
                // ClaudeClient: Container.get<IClient>('claudeClient'),
                LocalizationClient: Container.get<IClient>('localizationClient')
            };

            await Promise.all(
                Object.entries(clients).map(async ([name, client]) => {
                    await client.connect();
                    this.logger.info(`${name} connected`);
                })
            );
        } catch (error) {
            this.logger.error('Error starting clients', { error });
            process.exit(1);
        }
    }

    private async gracefulShutdown(): Promise<void> {
        this.logger.info('Received shutdown signal');

        const shutdownTimeout = setTimeout(() => {
            this.logger.error('Forced shutdown due to timeout'); process.exit(1);
        }, 10000);

        try {
            const clients = {
                GoogleClient: Container.get<IClient>('googleClient'),
                // ClaudeClient: Container.get<IClient>('claudeClient'),
                LocalizationClient: Container.get<IClient>('localizationClient')
            };

            await Promise.all([
                mongoose.connection.close()
                    .then(() => this.logger.info('MongoDB disconnected'))
                    .catch(err => this.logger.error('MongoDB disconnect error:', err)),
                ...Object.entries(clients).map(async ([name, client]) => {
                    try {
                        await client.disconnect();
                        this.logger.info(`${name} disconnected`);
                    } catch (error) {
                        this.logger.error(`Error disconnecting ${name}:`, error);
                    }
                })
            ]);

            clearTimeout(shutdownTimeout);
            this.logger.info('All connections closed'); process.exit(0);
        } catch (error) {
            clearTimeout(shutdownTimeout);
            this.logger.error('Fatal error during graceful shutdown', { error }); process.exit(1);
        }
    }
}