import { User } from "../models/impl.user.model";

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
    update(id: string, data: Partial<User>): Promise<void>;
    delete(id: string): Promise<void>;
}