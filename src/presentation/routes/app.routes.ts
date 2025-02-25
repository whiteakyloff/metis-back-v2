import express from "express";
import { Container } from "typedi";

import { useExpressServer } from "routing-controllers";

import { ErrorHandlerMiddleware } from "@presentation/middlewares/error.middleware";

import { AppController } from "@presentation/controllers/app.controller";
import { AuthController } from '@presentation/controllers/auth.controller';
import { ITokenService } from "@domain/services/impl.token.service";
import { IUserRepository } from "@domain/repositories/impl.user.repository";

export const appRoutes = {
    controllers: [
        AuthController, AppController
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

                    if (!token) {
                        return false;
                    }
                    const tokenService = Container.get<ITokenService>('tokenService');
                    const decoded = await tokenService.verifyToken(token);

                    if (!decoded?.userId) {
                        return false;
                    }
                    const userRepository = Container.get<IUserRepository>('userRepository');
                    const user = await userRepository.findById(decoded!.userId);

                    if (!user) return false; action.request.user = user; return true
                } catch (error) {
                    return false;
                }
            }
        });
    }
};