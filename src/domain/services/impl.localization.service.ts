export interface ILocalizationService {
    refreshLocalization(): Promise<Record<string, string>>

    getText(): Promise<Record<string, string>>
    getTextById(id: string): Promise<string>
}