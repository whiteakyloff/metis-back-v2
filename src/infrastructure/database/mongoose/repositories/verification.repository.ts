import { Service } from 'typedi';
import { VerificationCode } from "@domain/models/impl.verification.model";
import { VerificationCodeModel } from "../models/verification.model";
import { IVerificationRepository } from "@domain/repositories/impl.verification.repository";

@Service()
export class VerificationRepository implements IVerificationRepository {
    async findByEmail(email: string): Promise<VerificationCode | null> {
        const verificationCode = await VerificationCodeModel.findOne({ email }).lean();

        return verificationCode ? this.mapToEntity(verificationCode) : null;
    }

    async save(verificationCode: VerificationCode): Promise<void> {
        await VerificationCodeModel.create({
            email: verificationCode.email,
            verificationCode: verificationCode.verificationCode,
            attemptsCount: verificationCode.attemptsCount,
            expiresAt: verificationCode.codeExpiresAt
        })
    }

    async delete(email: string): Promise<void> {
        await VerificationCodeModel.deleteOne({ email }).exec();
    }

    async update(email: string, data: Partial<VerificationCode>): Promise<void> {
        await VerificationCodeModel.updateOne({ email }, data).exec();
    }

    private mapToEntity(doc: any): VerificationCode {
        return new VerificationCode(
            doc.email, doc.verificationCode,
            doc.attemptsCount, doc.expiresAt
        );
    }
}