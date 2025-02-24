import express from "express";

import { useExpressServer } from "routing-controllers";

import { ErrorHandlerMiddleware } from "@presentation/middlewares/error.middleware";

import { AppController } from "@presentation/controllers/app.controller";
import { AuthController } from '@presentation/controllers/auth.controller';
import {ITokenService} from "@domain/services/impl.token.service";
import {Container} from "typedi";
import {IUserRepository} from "@domain/repositories/impl.user.repository";
import {AppError} from "@infrastructure/errors/app.error";
import {AuthErrorMiddleware} from "@presentation/middlewares/auth.middleware";

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
            middlewares: [ErrorHandlerMiddleware, AuthErrorMiddleware],

            authorizationChecker: async (action, roles) => {
                if (roles === undefined) {
                    return true;
                }
                try {
                    const token = action.request.headers.authorization?.split(' ')[1];

                    if (!token) {
                        action.request.appError = new AppError('UNAUTHORIZED', 'No token provided', 401);
                        return false;
                    }
                    const tokenService = Container.get<ITokenService>('tokenService');
                    const userRepository = Container.get<IUserRepository>('userRepository');

                    try {
                        const decoded = await tokenService.verifyToken(token);
                        const user = await userRepository.findById(decoded!.userId);

                        if (!user) {
                            action.request.appError = new AppError('UNAUTHORIZED', 'Invalid token', 401);
                            return false;
                        }
                        action.request.user = user; return true;
                    } catch (error) {
                        action.request.appError = new AppError(
                            'UNAUTHORIZED', error instanceof Error ? error.message : 'Invalid token', 401
                        );
                        return false;
                    }
                } catch (error) {
                    action.request.appError = new AppError('UNAUTHORIZED', 'Authentication failed', 401); return false;
                }
            }
        });
    }
};