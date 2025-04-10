import { Container, Service } from "typedi";
import { Body, Get, HttpCode, JsonController, Param, Post } from "routing-controllers";

import { User } from "@modules/auth/domain/models/impl.user.model";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { BaseAIClient } from "@shared/domain/clients/base.client";
import { ClientRegistry } from "@shared/domain/clients/client.registry";

@Service()
@JsonController("/utility")
export class UtilityController
{
    private readonly clientRegistry = Container.get(ClientRegistry);

    @Get("/health") @HttpCode(200)
    async health() {
        return {
            success: true, data: { message: 'status: OK' }
        };
    }

    @Get("/remove/:email") @HttpCode(201)
    async remove(
        @Param('email') email: string
    ) {
        try {
            await Container.get<BaseRepository<User>>("userRepository").deleteBy({
                email
            });
            return { success: true, data: { message: 'User removed' } };
        } catch (error) {
            return { success: false, error: { message: 'User not found' } };
        }
    }

    @Post("/request/:client") @HttpCode(201)
    async request(
        @Param('client') client: string,
        @Body() body: { message: string }
    ) {
        const response = await (this.clientRegistry.getClient(client) as BaseAIClient<any>).doRequest(body.message);

        if (response) {
            return {
                success: true,
                data: { message: response }
            };
        }
        throw new AppError('REQUEST_FAILED', 'Request failed', 400);
    }
}