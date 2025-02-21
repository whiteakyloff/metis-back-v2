import { Container, Service } from "typedi";
import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { ValidateBody } from '../decorators/validation.decorator';

import { AppError } from "@infrastructure/errors/app.error";
import { authSchema } from "@presentation/validators/auth.validator";

import { RegisterDTO } from "@domain/dto/auth/register.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";

@Service()
@JsonController("/auth")
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
}