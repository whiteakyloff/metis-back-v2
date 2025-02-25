import { User } from "../models/impl.user.model";

export interface IUserRepository {
    save(user: User): Promise<void>

    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>

    deleteById(id: string): Promise<void>
    deleteByEmail(email: string): Promise<void>

    updateById(id: string, data: Partial<User>): Promise<void>
    updateByEmail(email: string, data: Partial<User>): Promise<void>
}