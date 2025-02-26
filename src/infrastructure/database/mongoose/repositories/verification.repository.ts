import { Service } from 'typedi';

import { BaseRepository } from "@domain/repositories/base.repository";
import { VerificationCode } from "@domain/models/impl.verification.model";
import { VerificationCodeModel } from "../models/verification.model";

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
        const users = await VerificationCodeModel.find().lean();
        return users.map(user => this.mapToEntity(user));
    }

    async findBy(filter: Partial<VerificationCode>): Promise<VerificationCode | null> {
        const user = await VerificationCodeModel.findOne(filter).lean();
        return user ? this.mapToEntity(user) : null;
    }

    async updateBy(filter: Partial<VerificationCode>, entity: Partial<VerificationCode>): Promise<void> {
        await VerificationCodeModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<VerificationCode>): Promise<void> {
        await VerificationCodeModel.deleteOne(filter).exec();
    }

    private mapToEntity(doc: any): VerificationCode {
        return new VerificationCode(
            doc.email, doc.attemptsCount,
            doc.codeExpiresAt, doc.verificationCode
        );
    }
}