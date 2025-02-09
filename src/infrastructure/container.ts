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
import {RegisterUseCase} from "../application/use-cases/register.use-case";

export const setupContainer = () => {
    // Main services
    Container.set('config', config);
    Container.set('logger', new LoggerService());

    // Repositories
    Container.set('userRepository', new UserRepository());

    // Services
    Container.set('localizationService', new LocalizationService(config));
    Container.set('passwordHasher', new PasswordHasher());
    Container.set('mailService', new MailService(config));
    Container.set('tokenService', new JwtTokenService(config));

    // Clients
    Container.set('googleClient', new GoogleClient(
        Container.get('Logger'), config)
    );
    Container.set('claudeClient', new ClaudeClient(
        Container.get('Logger'), config)
    );

    // Use cases
    Container.set(RegisterUseCase, new RegisterUseCase(
        Container.get('Logger'),
        Container.get('MailService'),
        Container.get('UserRepository'),
        Container.get('localizationService'),
        Container.get('PasswordHasher')
    ));
}
