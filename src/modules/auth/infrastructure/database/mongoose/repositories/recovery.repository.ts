import { Service } from 'typedi';

import { Recovery } from "@modules/auth/domain/models/impl.recovery.model";
import { RecoveryModel } from "../models/recovery.model";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class RecoveryRepository extends BaseRepository<Recovery> {
    async save(recovery: Recovery): Promise<void> {
        await RecoveryModel.create({
            email: recovery.email,
            recoveryKey: recovery.recoveryKey,
            expiresAt: recovery.expiresAt, used: recovery.used
        });
    }

    async findAll(): Promise<Recovery[]> {
        const recoveries = await RecoveryModel.find().lean();
        return recoveries.map(this.mapToEntity);
    }

    async findBy(filter: Partial<Recovery>): Promise<Recovery | null> {
        const recovery = await RecoveryModel.findOne(filter).lean();
        return recovery ? this.mapToEntity(recovery) : null;
    }

    async updateBy(filter: Partial<Recovery>, entity: Partial<Recovery>): Promise<void> {
        await RecoveryModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<Recovery>): Promise<void> {
        await RecoveryModel.deleteOne(filter).exec();
    }

    private mapToEntity = (doc: any): Recovery => {
        return new Recovery(
            doc.email,
            doc.recoveryKey,
            doc.expiresAt, doc.used
        );
    }
}