import express from "express";
import { Container } from "typedi";

import { useExpressServer } from "routing-controllers";
import { ErrorHandlerMiddleware } from "@shared/presentation/middlewares/error.middleware";

import { AuthController } from '@modules/auth/presentation/controllers/auth.controller';
import { DeckController } from "@modules/flashcards/presentation/controllers/deck.controller";
import { CardController } from "@modules/flashcards/presentation/controllers/card.controller";
import { UtilityController } from "@shared/presentation/controllers/utility.controller";

import { ITokenService } from "@modules/auth/domain/services/impl.token.service";

export const appRoutes = {
    controllers: [
        AuthController, UtilityController,
        DeckController, CardController
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

            authorizationChecker: async (action, roles) => {
                return await (Container.get<ITokenService>("tokenService"))
                    .checkAuthorization(action, roles);
            }
        });
    }
};