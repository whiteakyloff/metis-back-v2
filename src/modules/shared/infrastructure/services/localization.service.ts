import NodeCache from "node-cache";
import { Inject, Service } from "typedi";

import { AppConfig } from "@config";
import { AppError } from "@shared/infrastructure/errors/app.error";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

@Service()
export class LocalizationService implements ILocalizationService {
    private readonly filePath: string;
    private readonly localizationCache: NodeCache;
    private readonly refreshIntervalMs: number = 60 * 60 * 1000;

    private updateCallbacks: (() => void)[] = [];

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
            throw new AppError('LOCALIZATION_ERROR', 'Error fetching localization file', 400);
        }
        const data = (await response.json()) as Record<string, string>;
        this.localizationCache.set('localization', data);

        this.updateCallbacks.forEach(callback => callback());
    }

    onUpdate(callback: () => void): void {
        this.updateCallbacks.push(callback);
    }

    getText(): Record<string, string> {
        return this.localizationCache.get<Record<string, string>>('localization') || {};
    }

    getTextById(id: string, replace?: Record<string, string>): string {
        const localizationData = this.localizationCache.get<Record<string, string>>('localization');
        let text = localizationData ? localizationData[id] || id : id;

        if (replace) {
            Object.entries(replace).forEach(([key, value]) => {
                text = text.replace(`{${key}}`, value);
            });
        }
        return text;
    }
}
