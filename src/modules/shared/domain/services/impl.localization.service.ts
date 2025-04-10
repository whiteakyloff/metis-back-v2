export interface ILocalizationService {
    refreshLocalization(): Promise<void>;

    onUpdate(callback: () => void): void;

    getText(): Record<string, string>;
    getTextById(id: string, replace?: Record<string, string>): string;
}