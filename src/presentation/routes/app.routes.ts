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
            controllers: appRoutes.controllers,
            middlewares: [ErrorHandlerMiddleware],
            defaultErrorHandler: false, cors: true,
            validation: { whitelist: true, forbidNonWhitelisted: true },
        })
    }
};