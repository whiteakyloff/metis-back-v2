import 'reflect-metadata';

import express from 'express';
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { config } from "@config";
import { Server } from "socket.io";
import { Container } from "typedi";
import { useContainer } from "routing-controllers";
import { setupContainer } from "@shared/infrastructure/container";
import { errorHandler } from "@shared/presentation/middlewares/error.middleware";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { ClientRegistry } from "@shared/domain/clients/client.registry";

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
            await Promise.all([
                mongoose.connect(config.mongodb), this.setupRoutes(), this.startClients()
            ]);
            const httpServer = this.expressApp.listen(this.port, () => {
                this.logger.info(`Server is running on port ${config.port}`);
                this.logger.info(`Environment: ${config.nodeEnv}`);
                this.logger.info(`Started at: ${new Date().toISOString()}`);
            });
            this.io.attach(httpServer);

            process.on('SIGINT', this.gracefulShutdown.bind(this));
            process.on('SIGTERM', this.gracefulShutdown.bind(this));
        } catch (error) {
            this.logger.error('Error starting server', { error }); process.exit(1);
        }
    }

    private setupErrorHandling(): void {
        this.expressApp.use(errorHandler);
    }

    private setupMiddlewares(): void {
        this.expressApp.use(cors({
            origin: config.corsOrigin,
            credentials: true
        }));
        this.expressApp.use(compression());
        this.expressApp.use(helmet());

        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 15,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                success: false, error: {
                    code: 'TOO_MANY_REQUESTS', message: Container.get<ILocalizationService>('localizationService').getTextById('TOO_MANY_REQUESTS')
                }
            }
        });
        this.expressApp.use('/v0/account/login', authLimiter);
        this.expressApp.use('/v0/account/register', authLimiter);
    }

    private async setupRoutes(): Promise<void> {
        try {
            const { appRoutes } = await import('@shared/presentation/routes/app.routes');

            appRoutes.setup(this.expressApp);
        } catch (error) {
            this.logger.error('Error setting up routes', { error });
            process.exit(1);
        }
    }

    private async startClients(): Promise<void> {
        try {
            const clientRegistry = Container.get<ClientRegistry>('clientRegistry');

            await clientRegistry.connectAll();
            this.logger.info('All clients connected successfully', {
                clients: Object.values(clientRegistry.getClients()).map(client => client.constructor.name)
            });
        } catch (error) {
            this.logger.error('Error starting clients', { error });
        }
    }

    private async stopClients(): Promise<void> {
        try {
            const clientRegistry = Container.get<ClientRegistry>('clientRegistry');

            await clientRegistry.disconnectAll();
            this.logger.info('All clients disconnected successfully', {
                clients: Object.values(clientRegistry.getClients()).map(client => client.constructor.name)
            });
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
            await Promise.all([
                mongoose.connection.close(), this.stopClients()
            ]);
            clearTimeout(shutdownTimeout);
            this.logger.info('All connections closed'); process.exit(0);
        } catch (error) {
            clearTimeout(shutdownTimeout);
            this.logger.error('Fatal error during graceful shutdown', { error }); process.exit(1);
        }
    }
}