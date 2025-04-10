import jwt from 'jsonwebtoken';

import { Service, Inject, Container } from 'typedi';

import { AppConfig } from '@config';
import { ITokenService } from "../../domain/services/impl.token.service";
import { Action } from "routing-controllers";
import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { User } from "@modules/auth/domain/models/impl.user.model";

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

    async checkAuthorization(action: Action, _roles: any[]): Promise<boolean> {
        try {
            const token = action.request.headers.authorization?.split(' ')[1];
            if (!token) {
                return false;
            }
            const decoded = await this.verifyToken(token);
            if (!decoded?.userId) {
                return false;
            }
            const user = await Container.get<BaseRepository<User>>('userRepository').findBy({
                id: decoded.userId
            });
            if (!user) { return false; } action.request.user = user; return true
        } catch (error) {
            console.log('Error checking authorization', { error });
            return false;
        }
    }
}