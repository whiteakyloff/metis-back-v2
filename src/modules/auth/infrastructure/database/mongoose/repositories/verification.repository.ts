import { Service } from 'typedi';

import { VerificationCode } from "@modules/auth/domain/models/impl.verification.model";
import { VerificationCodeModel } from "../models/verification.model";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class VerificationRepository extends BaseRepository<VerificationCode> {
    async save(verificationCode: VerificationCode): Promise<void> {
        await VerificationCodeModel.create({
            email: verificationCode.email,
            verificationCode: verificationCode.verificationCode,
            attemptsCount: verificationCode.attemptsCount,
            codeExpiresAt: verificationCode.codeExpiresAt
        })
    }
    async findAll(): Promise<VerificationCode[]> {
        const verificationCodes = await VerificationCodeModel.find().lean();
        return verificationCodes.map(this.mapToEntity);
    }

    async findBy(filter: Partial<VerificationCode>): Promise<VerificationCode | null> {
        const verificationCode = await VerificationCodeModel.findOne(filter).lean();
        return verificationCode ? this.mapToEntity(verificationCode) : null;
    }

    async updateBy(filter: Partial<VerificationCode>, entity: Partial<VerificationCode>): Promise<void> {
        await VerificationCodeModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<VerificationCode>): Promise<void> {
        await VerificationCodeModel.deleteOne(filter).exec();
    }

    private mapToEntity = (doc: any): VerificationCode => {
        return new VerificationCode(
            doc.email, doc.attemptsCount,
            doc.codeExpiresAt, doc.verificationCode
        );
    }
}