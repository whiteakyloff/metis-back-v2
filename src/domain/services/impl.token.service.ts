export interface ITokenService {
    generateToken(payload: { userId: string; email: string }): Promise<string>;
    verifyToken(token: string): Promise<{ userId: string; email: string } | undefined>;
}