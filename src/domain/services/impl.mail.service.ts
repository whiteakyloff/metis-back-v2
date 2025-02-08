export interface IMailService {
    sendVerificationEmail(to: string, code: string): Promise<void>;
}