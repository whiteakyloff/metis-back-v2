import { Container, Service } from "typedi";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Authorized, Body, Get, HttpCode, JsonController, Post } from "routing-controllers";

import { User } from "@domain/models/impl.user.model";
import { AppError } from "@infrastructure/errors/app.error";
import { UserInfoDTO } from "@domain/dto/application/user-info.dto";
import { IAIClient } from "@domain/clients/impl.client";

@Service()
@JsonController("/app")
export class AppController
{
    @Get("/health") @HttpCode(200)
    async health() {
        return { success: true, data: { message: 'status: OK' } };
    }

    @Post("/request") @HttpCode(201)
    async request(
        @Body() body: { message: string }
    ) {
        const response = await Container.get<IAIClient>('qwenClient').doRequest(body.message);

        if (response) {
            return {
                success: true,
                data: { message: response }
            };
        }
        throw new AppError('REQUEST_FAILED', 'Request failed', 400);
    }

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
}
