import { Result } from "@shared/infrastructure/core/result";
import { SendVerifyEmailDTO, VerifyEmailDTO } from "../dto/verify-email.dto";
import { RecoveryResponseDTO } from "@modules/auth/domain/dto/recovery.dto";

export interface IVerificationService {
    verifyEmail(data: VerifyEmailDTO): Promise<Result<string | RecoveryResponseDTO>>;

    createVerificationCode(data: SendVerifyEmailDTO): Promise<Result<string>>;
}