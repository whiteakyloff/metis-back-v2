import { Container } from "typedi";

import { config } from "@config";
import { LoggerService } from "./services/logger.service";

import { MailService } from "./services/mail.service";
import { PasswordHasher } from "./services/hasher.service";
import { JwtTokenService } from "./services/token.service";
import { LocalizationService } from "./services/localization.service";

import { GoogleClient } from "./clients/google.client";
import { ClaudeClient } from "./clients/claude.client";

import { UserRepository } from "./database/mongoose/repositories/user.repository";
import { RegisterUseCase } from "../application/use-cases/register.use-case";
import { Server } from "socket.io";
import { App } from "../app";
import { createServer } from 'http';
import {LocalizationClient} from "@infrastructure/clients/localization.client";

export const setupContainer = (app: App) => {
    // Main services
    Container.set('config', config);
    Container.set('logger', new LoggerService());
    Container.set('socket.io', new Server(
        createServer(app.expressApp), { cors: { origin: config.corsOrigin } }
    ))

    // Repositories
    Container.set('userRepository', new UserRepository());

    // Services
    Container.set('localizationService', new LocalizationService(config));

    Container.set('passwordHasher', new PasswordHasher());
    Container.set('mailService', new MailService(config));
    Container.set('tokenService', new JwtTokenService(config));

    // Clients
    Container.set('googleClient', new GoogleClient(config));
    Container.set('claudeClient', new ClaudeClient(config));
    Container.set('localizationClient', new LocalizationClient(
        Container.get('localizationService'), Container.get('socket.io')
    ));

    // Use cases
    Container.set(RegisterUseCase, new RegisterUseCase(
        Container.get('logger'),
        Container.get('mailService'),
        Container.get('userRepository'),
        Container.get('localizationService'),
        Container.get('passwordHasher')
    ));
}
