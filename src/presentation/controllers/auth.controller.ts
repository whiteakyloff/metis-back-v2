import {Inject, Service} from "typedi";
import {Body, JsonController, Post, Res, UseBefore} from "routing-controllers";
import {RegisterDTO} from "@domain/dto/auth/register.dto";
import {Response} from "express";
import {RegisterUseCase} from "../../application/use-cases/register.use-case";
import {validate} from "@presentation/middlewares/validation.middleware";
import {authSchema} from "@presentation/validators/auth.validator";

@Service()
@JsonController("/auth")
export class AuthController {
    constructor(
        @Inject('registerUseCase')
        private readonly registerUseCase: RegisterUseCase
    ) {}

    @Post("/register")
    @UseBefore(validate(authSchema.register))
    async register(@Body() body: RegisterDTO, @Res() res: Response) {
        const result = await this.registerUseCase.execute(body);

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