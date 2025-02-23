import { Result } from "@infrastructure/core/result";
import { VerifyEmailDTO } from "@domain/dto/auth/verify-email.dto";

export interface VerificationCodeResult {
    code: string; message: string;
}

export interface IVerificationService {
    createVerificationCode(email: string): Promise<Result<VerificationCodeResult>>;

    verifyEmail(data: VerifyEmailDTO): Promise<Result<string>>;
}