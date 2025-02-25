import { Result } from "@infrastructure/core/result";
import {SendVerifyEmailDTO, VerifyEmailDTO} from "@domain/dto/auth/verify-email.dto";

export interface IVerificationService {
    createVerificationCode(data: SendVerifyEmailDTO): Promise<Result<string>>;

    verifyEmail(data: VerifyEmailDTO): Promise<Result<string>>;
}