import express from "express";
import { Container } from "typedi";

import { useExpressServer } from "routing-controllers";
import { ErrorHandlerMiddleware } from "@shared/presentation/middlewares/error.middleware";

import { User } from "@modules/auth/domain/models/impl.user.model";

import { AuthController } from '@modules/auth/presentation/controllers/auth.controller';
import { FlashcardsController } from "@modules/flashcards/presentation/controllers/flashcards.controller";
import { UtilityController } from "@shared/presentation/controllers/utility.controller";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { ITokenService } from "@modules/auth/domain/services/impl.token.service";

export const appRoutes = {
    controllers: [
        AuthController, FlashcardsController, UtilityController
    ],
    setup: (expressApp: express.Application) => {
        useExpressServer(expressApp, {
            routePrefix: '/v0',
            defaults: {
                nullResultCode: 404,
                undefinedResultCode: 204,
                paramOptions: {
                    required: true
                }
            },
            cors: true,
            classTransformer: true,
            validation: {
                whitelist: true,
                forbidNonWhitelisted: true
            },
            defaultErrorHandler: false,
            controllers: appRoutes.controllers,
            middlewares: [ ErrorHandlerMiddleware ],

            authorizationChecker: async (action, _roles) => {
                try {
                    const token = action.request.headers.authorization?.split(' ')[1];
                    if (!token) return false;

                    const decoded = await Container.get<ITokenService>('tokenService').verifyToken(token);
                    if (!decoded?.userId) return false;

                    const user = await Container.get<BaseRepository<User>>('userRepository').findBy({
                        id: decoded.userId
                    });
                    if (!user) return false; action.request.user = user; return true
                } catch {
                    return false;
                }
            }
        });
    }
};