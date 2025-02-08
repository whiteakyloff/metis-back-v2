import NodeCache from "node-cache";

import { Inject, Service } from "typedi";

import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";
import { ILocalizationService } from "@domain/services/impl.localization.service";

@Service()
export class LocalizationService implements ILocalizationService {
    private readonly filePath: string;
    private localizationCache: NodeCache;

    constructor(
        @Inject('config') // Inject the configuration object
        private readonly config: AppConfig
    ) {
        this.localizationCache = new NodeCache({ stdTTL: 60 * 60 });
        this.filePath = this.config.github.url + '/localization/en.json';
    }

    async refreshLocalization(): Promise<Record<string, string>> {
        const request = await fetch(this.filePath, {
            headers: {
                Authorization: `token ${this.config.github.token}`,
                Accept: 'application/vnd.github.v3.raw'
            }
        });

        if (!request.ok) {
            throw new AppError(
                'LOCALIZATION_ERROR',
                'Error fetching localization file', 400);
        }
        const localizationData = (await request.json()) as Record<string, string>;

        this.localizationCache.set('localization', localizationData); return localizationData;
    }

    async getText(): Promise<Record<string, string>> {
        let localizationData = this.localizationCache.get<Record<string, string>>('localization');
        if (!localizationData) {
            localizationData = await this.refreshLocalization();
        }
        return localizationData;
    }

    async getTextById(id: string): Promise<string> {
        let localizationData = this.localizationCache.get<Record<string, string>>('localization');
        if (!localizationData) {
            localizationData = await this.refreshLocalization();
        }
        const text = localizationData[id];

        if (!text) {
            throw new AppError('LOCALIZATION_ERROR', `Localization "${id}" not found`, 400);
        }
        return text;
    }
}