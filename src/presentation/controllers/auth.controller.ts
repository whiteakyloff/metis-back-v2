import { Response } from "express";

import { Container, Service } from "typedi";
import { Body, JsonController, Post, Res, UseBefore } from "routing-controllers";

import { authSchema } from "@presentation/validators/auth.validator";
import { validate } from "@presentation/middlewares/validation.middleware";

import type { RegisterDTO } from "@domain/dto/auth/register.dto";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";

@Service()
@JsonController("/auth")
export class AuthController {
    @Post("/register")
    @UseBefore(validate(authSchema.register))
    async register(@Body() body: RegisterDTO, @Res() res: Response) {
        const result = await Container.get(RegisterUseCase).execute(body);

        if (result.isSuccess()) {
            return res.status(201).json({
                success: true,
                data: result.getValue()
            });
        }
        return res.status(400).json({
            success: false,
            error: { message: result.getError() }
        });
    }
}