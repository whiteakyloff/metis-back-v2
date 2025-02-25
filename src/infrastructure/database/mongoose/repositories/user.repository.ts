import { Service } from 'typedi';
import { User } from "@domain/models/impl.user.model";
import { UserModel } from "../models/user.model";
import { IUserRepository } from "@domain/repositories/impl.user.repository";

@Service()
export class UserRepository implements IUserRepository {
    async save(user: User): Promise<void> {
        await UserModel.create({
            _id: user.id, email: user.email,
            username: user.username, password: user.password,
            emailVerified: user.emailVerified, authMethod: user.authMethod
        });
    }

    private mapToEntity(doc: any): User {
        return new User(
            doc._id, doc.email,
            doc.username, doc.password,
            doc.emailVerified, doc.authMethod,
        );
    }

    async findById(id: string): Promise<User | null> {
        const user = await UserModel.findById(id).lean();
        return user ? this.mapToEntity(user) : null;
    }
    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).lean();
        return user ? this.mapToEntity(user) : null;
    }

    async deleteById(id: string): Promise<void> {
        await UserModel.deleteOne({ _id: id }).exec();
    }
    async deleteByEmail(email: string): Promise<void> {
        await UserModel.deleteOne({ email }).exec();
    }

    async updateById(id: string, data: Partial<User>): Promise<void> {
        await UserModel.updateOne({ _id: id }, data).exec();
    }
    async updateByEmail(email: string, data: Partial<User>): Promise<void> {
        await UserModel.updateOne({ email }, data).exec();
    }
}
