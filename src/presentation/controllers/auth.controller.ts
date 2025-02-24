import { Container, Service } from "typedi";
import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { ValidateBody } from "@presentation/middlewares/validation.middleware";

import { AppError } from "@infrastructure/errors/app.error";
import { authSchema } from "@presentation/validators/auth.validator";

import { RegisterDTO } from "@domain/dto/auth/register.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { VerifyEmailDTO } from "@domain/dto/auth/verify-email.dto";
import { IVerificationService } from "@domain/services/impl.verification.service";
import { LoginDTO } from "@domain/dto/auth/login.dto";
import { LoginUseCase } from "../../application/use-cases/login.use-case";

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
                data: result.getValue()
            };
        }
        throw new AppError('REGISTER_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/login") @HttpCode(200)
    async login(
        @Body() @ValidateBody(authSchema.login) body: LoginDTO
    ) {
        const result = await Container.get(LoginUseCase).execute(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('LOGIN_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/login/google") @HttpCode(200)
    async loginWithGoogle(
        @Body() body: { access_token: string }
    ) {
        const result = await Container.get(LoginUseCase).executeWithGoogle(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('LOGIN_GOOGLE_RESULT_FAILURE', result.getError(), 400);
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

    @Post("/verify-email/resend") @HttpCode(201)
    async resendVerificationEmail(
        @Body() @ValidateBody(authSchema.resendVerificationEmail) body: { email: string }
    ) {
        const result = await Container.get<IVerificationService>("verificationService").createVerificationCode(body.email);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue().message }
            };
        }
        throw new AppError('RESEND_VERIFY_EMAIL_RESULT_FAILURE', result.getError(), 400);
    }
}