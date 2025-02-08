import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
import compression from "compression";

import { config } from "@config";
import { Container } from "typedi";
import { useContainer } from "routing-controllers";
import { setupContainer } from "@infrastructure/container";
import { ILogger } from "@domain/services/impl.logger.service";
import { errorHandler } from "@presentation/middlewares/error.middleware";

export class App {
    private readonly app: express.Application;
    private readonly port: number;
    private readonly logger: ILogger;

    constructor() {
        setupContainer(); useContainer(Container);

        this.app = express();
        this.port = config.port;
        this.logger = Container.get('logger');

        this.setupMiddlewares(); this.setupErrorHandling();
    }

    public async start(): Promise<void> {
       try {
           await this.connectToDatabase()

           this.app.listen(this.port, () => {
               this.logger.info(`Server is running on port ${config.port}`);
               this.logger.info(`Environment: ${config.nodeEnv}`);
               this.logger.info(`Started at: ${new Date().toISOString()}`);
           });

           process.on('SIGINT', this.gracefulShutdown.bind(this));
           process.on('SIGTERM', this.gracefulShutdown.bind(this));
       } catch (error) {
           this.logger.error('Error starting server', { error }); process.exit(1);
       }
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private setupMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors({
            origin: config.corsOrigin, credentials: true
        }));

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 хвилин
            limit: 100 // обмеження до 100 запитів за цей проміжок часу з одного IP
        });
        this.app.use(limiter);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(compression());
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.mongodbUri);
            this.logger.info('Successfully connected to MongoDB');
        } catch (error) {
            this.logger.error('Error connecting to MongoDB', { error }); process.exit(1);
        }
    }

    private async gracefulShutdown(): Promise<void> {
        this.logger.info('Received shutdown signal');

        try {
            await mongoose.connection.close();
            this.logger.info('MongoDB connection closed'); process.exit(0);
        } catch (error) {
            this.logger.error('Error during graceful shutdown', { error }); process.exit(1);
        }
    }
}