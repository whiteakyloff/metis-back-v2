import { Inject, Service } from "typedi";
import { Server, Socket } from "socket.io";

import { IClient } from "@domain/clients/impl.client";
import { AppError } from "@infrastructure/errors/app.error";
import { ILocalizationService } from "@domain/services/impl.localization.service";

@Service()
export class LocalizationClient implements IClient {
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
    connect(): Promise<void> {
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

    disconnect(): Promise<void> {
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
        this.io.to('localization_en').emit('translationsUpdate', localization);
    }

    private sendLocalizationToClient(socket: Socket): void {
        const localization = this.localizationService.getText();
        socket.emit('localizationUpdate', localization);
    }
}