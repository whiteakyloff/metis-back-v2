import bcrypt from 'bcrypt';
import { Service } from 'typedi';

import { IHasher } from "@shared/domain/services/impl.hasher.service";

@Service()
export class HasherService implements IHasher {
    private readonly SALT_ROUNDS = 10;

    async hash(string: string): Promise<string> {
        return bcrypt.hash(string, this.SALT_ROUNDS);
    }

    async compare(string: string, hash: string | null | undefined): Promise<boolean> {
        return hash ? bcrypt.compare(string, hash) : false;
    }
}