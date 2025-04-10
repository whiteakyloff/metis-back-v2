import { randomInt } from 'crypto';
import { addMinutes } from "date-fns";

export class VerificationCode {
    constructor(
        public email: string,
        public attemptsCount: number,
        public codeExpiresAt: Date | null,
        public verificationCode: string | null,
    ) {}

    update(): VerificationCode {
        this.codeExpiresAt = addMinutes(new Date(), 10);
        this.attemptsCount++;
        this.verificationCode = randomInt(100000, 999999).toString();

        return this;
    }

    isExpired(): boolean {
        return !this.codeExpiresAt || this.codeExpiresAt < new Date();
    }

    getRemainingTime(): number | null {
        if (!this.codeExpiresAt) return null;

        return Math.ceil(
            (this.codeExpiresAt.getTime() - Date.now()) / 1000 / 60
        );
    }

    static create(email: string): VerificationCode {
        return new VerificationCode(
            email, 1, addMinutes(new Date(), 10),
            randomInt(100000, 999999).toString()
        );
    }
}