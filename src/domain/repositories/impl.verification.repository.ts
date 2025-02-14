import { VerificationCode } from '../models/impl.verification.model'

export interface IVerificationRepository {
    findByEmail(email: string): Promise<VerificationCode | null>
    save(verificationCode: VerificationCode): Promise<void>
    delete(email: string): Promise<void>
    update(email: string, data: Partial<VerificationCode>): Promise<void>
}