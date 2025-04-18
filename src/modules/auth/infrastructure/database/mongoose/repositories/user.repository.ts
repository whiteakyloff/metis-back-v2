import { Service } from 'typedi';

import { User } from "@modules/auth/domain/models/impl.user.model";
import { UserModel } from "../models/user.model";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class UserRepository extends BaseRepository<User> {
    async save(user: User): Promise<void> {
        await UserModel.create({
            _id: user.id, email: user.email,
            username: user.username, password: user.password,
            emailVerified: user.emailVerified, authMethod: user.authMethod
        });
    }

    async findAll(): Promise<User[]> {
        const users = await UserModel.find().lean();
        return users.map(this.mapToEntity);
    }

    async findBy(filter: Partial<User>): Promise<User | null> {
        const user = await UserModel.findOne(filter).lean();
        return user ? this.mapToEntity(user) : null;
    }

    async updateBy(filter: Partial<User>, entity: Partial<User>): Promise<void> {
        await UserModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<User>): Promise<void> {
        await UserModel.deleteOne(filter).exec();
    }

    private mapToEntity = (doc: any): User => {
        return new User(
            doc._id, doc.email,
            doc.username, doc.password,
            doc.emailVerified, doc.authMethod,
        );
    }
}