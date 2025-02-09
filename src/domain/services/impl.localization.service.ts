export interface ILocalizationService {
    refreshLocalization(): Promise<void>

    getText(): Record<string, string>
    getTextById(id: string): string
}