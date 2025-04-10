import { Container, Service } from "typedi";
import { Authorized, Body, Get, HttpCode, JsonController, Param, Post } from "routing-controllers";
import { CurrentUser } from "@shared/presentation/decorators/route.decorator";
import { ValidateBody } from "@shared/presentation/middlewares/validation.middleware";

import { User } from "../../domain/models/impl.user.model";

import { RegisterDTO } from "../../domain/dto/register.dto";
import { LoginDTO } from "../../domain/dto/login.dto";
import { RecoveryDTO } from "../../domain/dto/recovery.dto";
import { UserInfoDTO } from "@modules/auth/domain/dto/user-info.dto";
import { SendVerifyEmailDTO, VerifyEmailDTO } from "../../domain/dto/verify-email.dto";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { authSchema } from "../../presentation/validators/auth.validator";
import { IVerificationService } from "../../domain/services/impl.verification.service";

import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { RecoveryUseCase } from "../../application/use-cases/recovery.use-case";

@Service()
@JsonController("/account")
export class AuthController
{
    private readonly loginUseCase = Container.get(LoginUseCase);
    private readonly registerUseCase = Container.get(RegisterUseCase);
    private readonly recoveryUseCase = Container.get(RecoveryUseCase);

    private readonly verificationService = Container.get<IVerificationService>("verificationService");

    @Authorized()
    @Get("/my-information") @HttpCode(200)
    async myInformation(
        @CurrentUser() currentUser: User
    ) {
        if (currentUser) {
            return {
                success: true,
                data: UserInfoDTO.fromEntity(currentUser)
            }
        }
        throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    @Post("/register") @HttpCode(201)
    async register(
        @Body() @ValidateBody(authSchema.register) body: RegisterDTO
    ) {
        const result = await this.registerUseCase.execute(body);

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
        const result = await this.loginUseCase.execute(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('LOGIN_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/login/:client") @HttpCode(200)
    async continueWithThirdParty(
        @Param('client') client: string,
        @Body() body: { access_token: string }
    ) {
        const result = await this.loginUseCase.executeWithThirdParty(body, client);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('LOGIN_THIRD_PARTY_FAILURE', result.getError(), 400);
    }

    @Post("/recovery/:recoveryKey") @HttpCode(201)
    async recovery(
        @Param('recoveryKey') recoveryKey: string,
        @Body() @ValidateBody(authSchema.recovery) body: RecoveryDTO
    ) {
        const result = await this.recoveryUseCase.execute(body, recoveryKey);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('RECOVERY_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/verify-email") @HttpCode(201)
    async verifyEmail(
        @Body() @ValidateBody(authSchema.verifyEmail) body: VerifyEmailDTO
    ) {
        const result = await this.verificationService.verifyEmail(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue() instanceof String
                    ? { message: result.getValue() } : result.getValue()
            };
        }
        throw new AppError('VERIFY_EMAIL_RESULT_FAILURE', result.getError(), 400);
    }

    @Post("/verify-email/resend") @HttpCode(201)
    async resendVerificationEmail(
        @Body() @ValidateBody(authSchema.sendVerificationEmail) body: SendVerifyEmailDTO
    ) {
        const result = await this.verificationService.createVerificationCode(body);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('RESEND_VERIFY_EMAIL_RESULT_FAILURE', result.getError(), 400);
    }
}