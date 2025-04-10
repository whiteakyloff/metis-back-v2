import jwt from 'jsonwebtoken';

import { Service, Inject } from 'typedi';

import { AppConfig } from '@config';
import { ITokenService } from "../../domain/services/impl.token.service";

@Service()
export class JwtTokenService implements ITokenService {
    constructor(
        @Inject('config')
        private readonly config: AppConfig
    ) {}

    async generateToken(payload: { userId: string; email: string }): Promise<string> {
        // @ts-ignore
        return jwt.sign(
            payload,
            this.config.jwt.secret, { expiresIn: this.config.jwt.expiresIn  }
        );
    }

    async verifyToken(token: string): Promise<{ userId: string; email: string } | undefined> {
        try {
            return jwt.verify(token, this.config.jwt.secret) as {
                userId: string;
                email: string;
            };
        } catch (error) {
            console.log('Error verifying token', { error });
            return undefined;
        }
    }
}