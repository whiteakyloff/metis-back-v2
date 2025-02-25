import { Service } from "typedi";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Authorized, Get, HttpCode, JsonController } from "routing-controllers";

import { User } from "@domain/models/impl.user.model";
import { AppError } from "@infrastructure/errors/app.error";
import { UserInfoDTO } from "@domain/dto/application/user-info.dto";

@Service()
@JsonController("/app")
export class AppController
{
    @Get("/health") @HttpCode(200)
    async health() {
        return { success: true, data: { message: 'status: OK' } };
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
