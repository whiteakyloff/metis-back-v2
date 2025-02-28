import { Container, Service } from "typedi";
import { Body, Get, HttpCode, JsonController, Post } from "routing-controllers";
import { ValidateBody } from "@presentation/middlewares/validation.middleware";

import { AppError } from "@infrastructure/errors/app.error";
import { authSchema } from "@presentation/validators/auth.validator";

import { RegisterDTO } from "@domain/dto/auth/register.dto";
import { LoginDTO } from "@domain/dto/auth/login.dto";
import {
    SendVerifyEmailDTO, VerifyEmailDTO
} from "@domain/dto/auth/verify-email.dto";
import { RecoveryDTO } from "@domain/dto/auth/recovery.dto";
import { User } from "@domain/models/impl.user.model";

import { LoginUseCase } from "@application/use-cases/login.use-case";
import { RegisterUseCase } from "@application/use-cases/register.use-case";
import { RecoveryUseCase } from "@application/use-cases/recovery.use-case";

import { BaseRepository } from "@domain/repositories/base.repository";
import { IVerificationService } from "@domain/services/impl.verification.service";

@Service()
@JsonController("/account")
export class AuthController {
    //test
    @Get("/remove") @HttpCode(201)
    async remove() {
        return await Container.get<BaseRepository<User>>("userRepository").deleteBy({
            email: "whiteakyloff@gmail.com"
        }).then(() => {
            return { success: true, data: { message: 'User removed' } }
        }).catch(() => {
            return { success: false, data: { message: 'User not found' } }
        });
    }

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
    async continueWithGoogle(
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
        @Body() @ValidateBody(authSchema.sendVerificationEmail) body: SendVerifyEmailDTO
    ) {
        const result = await Container.get<IVerificationService>("verificationService").createVerificationCode(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('RESEND_VERIFY_EMAIL_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/recovery") @HttpCode(201)
    async recovery(
        @Body() @ValidateBody(authSchema.recovery) body: RecoveryDTO
    ) {
        const result = await Container.get(RecoveryUseCase).execute(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('RECOVERY_RESULT_FAILURE', result.getError(), 400);
    }
}