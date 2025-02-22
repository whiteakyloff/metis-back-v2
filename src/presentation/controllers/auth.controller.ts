import { Container, Service } from "typedi";
import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { ValidateBody } from "@presentation/middlewares/validation.middleware";

import { AppError } from "@infrastructure/errors/app.error";
import { authSchema } from "@presentation/validators/auth.validator";

import { RegisterDTO } from "@domain/dto/auth/register.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { VerifyEmailDTO } from "@domain/dto/auth/verify-email.dto";
import { IVerificationService } from "@domain/services/impl.verification.service";

@Service()
@JsonController("/account")
export class AuthController {
    @Post("/register") @HttpCode(201)
    async register(
        @Body() @ValidateBody(authSchema.register) body: RegisterDTO
    ) {
        const result = await Container.get(RegisterUseCase).execute(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('REGISTER_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/verify-email") @HttpCode(201)
    async verifyEmail(
        @Body() @ValidateBody(authSchema.verifyEmail) body: VerifyEmailDTO
    ) {
        const result = await Container.get<IVerificationService>("verificationService").verifyEmail(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('VERIFY_EMAIL_RESULT_FAILURE', result.getError(), 400);
    }
}