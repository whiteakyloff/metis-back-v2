import { randomInt } from 'crypto';
import { addMinutes } from "date-fns";

export class VerificationCode {
    constructor(
        public readonly email: string,
        public readonly verificationCode: string | null,
        public readonly attemptsCount: number,
        public readonly codeExpiresAt: Date | null
    ) {}

    static create(email: string): VerificationCode {
        return new VerificationCode(
            email, randomInt(100000, 999999).toString(),
            1, addMinutes(new Date(), 10)
        );
    }
}