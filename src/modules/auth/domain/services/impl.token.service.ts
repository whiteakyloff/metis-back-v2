import { Action } from "routing-controllers";

export interface ITokenService {
    generateToken(payload: { userId: string; email: string }): Promise<string>;

    verifyToken(token: string): Promise<{ userId: string; email: string } | undefined>;

    checkAuthorization(action: Action, _roles: any[]): Promise<boolean>;
}