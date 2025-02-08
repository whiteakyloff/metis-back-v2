import bcrypt from 'bcrypt';

import { Service } from 'typedi';
import { IPasswordHasher } from '@domain/services/impl.hasher.service';

@Service()
export class PasswordHasher implements IPasswordHasher {
    private readonly SALT_ROUNDS = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}