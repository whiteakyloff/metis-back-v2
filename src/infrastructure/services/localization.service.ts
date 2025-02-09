import NodeCache from "node-cache";
import { Inject, Service } from "typedi";

import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";
import { ILocalizationService } from "@domain/services/impl.localization.service";

@Service()
export class LocalizationService implements ILocalizationService {
    private readonly filePath: string;
    private readonly localizationCache: NodeCache;
    private readonly refreshIntervalMs: number = 60 * 60 * 1000; // оновлення кожну годину

    constructor(
        @Inject('config')
        private readonly config: AppConfig
    ) {
        this.localizationCache = new NodeCache({ stdTTL: 60 * 60 });
        this.filePath = `${this.config.github.url}/localization/en.json`;

        this.refreshLocalization().catch(err => {
            throw new AppError('LOCALIZATION_ERROR', err.message, 400);
        });

        setInterval(() => {
            this.refreshLocalization().catch(err => {
                throw new AppError('LOCALIZATION_ERROR', err.message, 400);
            });
        }, this.refreshIntervalMs);
    }

    async refreshLocalization(): Promise<void> {
        const response = await fetch(this.filePath, {
            headers: {
                Authorization: `token ${this.config.github.token}`,
                Accept: 'application/vnd.github.v3.raw'
            }
        });

        if (!response.ok) {
            throw new AppError(
                'LOCALIZATION_ERROR',
                'Error fetching localization file',
                400
            );
        }

        const data = (await response.json()) as Record<string, string>;
        this.localizationCache.set('localization', data);
    }

    getTextById(id: string): string {
        const localizationData = this.localizationCache.get<Record<string, string>>('localization');
        return localizationData ? localizationData[id] || id : id;
    }

    getText(): Record<string, string> {
        return this.localizationCache.get<Record<string, string>>('localization') || {};
    }
}
