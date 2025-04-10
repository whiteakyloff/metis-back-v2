import { Inject, Service } from "typedi";
import { Server, Socket } from "socket.io";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { BaseClient } from "@shared/domain/clients/base.client";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

@Service()
export class LocalizationClient implements BaseClient<Server> {
    constructor(
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('socket.io')
        private readonly io: Server
    ) {
        this.localizationService.onUpdate(() => {
            this.broadcastLocalization();
        });
    }

    public getBase(): Server {
        return this.io;
    }

    async connect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (reason?: any) => void) => {
            try {
                this.io.on('connection', (socket) => {
                    socket.on('joinLocalizationRoom', () => {
                        socket.join(`localization_en`);
                        this.sendLocalizationToClient(socket);
                    });

                    socket.on('leaveLocalizationRoom', () => {
                        socket.leave(`localization_en`);
                    });
                });
                resolve();
            } catch (error) {
                reject(new AppError('LOCALIZATION_CLIENT_ERROR', 'Error connecting to Localization Client', 400));
            }
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve: () => void, reject: (reason?: any) => void) => {
            try {
                this.io.disconnectSockets();
                resolve();
            } catch (error) {
                reject(new AppError('LOCALIZATION_CLIENT_ERROR', 'Error disconnecting Localization Client', 400));
            }
        });
    }

    private broadcastLocalization(): void {
        const localization = this.localizationService.getText();

        this.io.to('localization_en').emit('translationsUpdate', {
            success: true, data: localization,
            timestamp: new Date().toISOString(), room: 'localization_en'
        });
    }

    private sendLocalizationToClient(socket: Socket): void {
        const localization = this.localizationService.getText();

        socket.emit('localizationUpdate', {
            success: true, data: localization,
            timestamp: new Date().toISOString(), room: 'localization_en'
        });
    }
}