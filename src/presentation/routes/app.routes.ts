import express from "express";

import { useExpressServer } from "routing-controllers";

import { ErrorHandlerMiddleware } from "@presentation/middlewares/error.middleware";

import { AppController } from "@presentation/controllers/app.controller";
import { AuthController } from '@presentation/controllers/auth.controller';

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
            middlewares: [ErrorHandlerMiddleware]
        });
    }
};