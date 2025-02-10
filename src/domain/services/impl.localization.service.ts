export interface ILocalizationService {
    refreshLocalization(): Promise<void>;

    onUpdate(callback: () => void): void;
    getText(): Record<string, string>; getTextById(id: string): string;
}