export interface IMailService {
    sendVerificationEmail(to: string, code: string): void;
}