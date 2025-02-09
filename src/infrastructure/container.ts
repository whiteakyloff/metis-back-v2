import { Container } from "typedi";

import { config } from "@config";
import { LoggerService } from "./services/logger.service";

import { MailService } from "./services/mail.service";
import { PasswordHasher } from "./services/hasher.service";
import { JwtTokenService } from "./services/token.service";
import { LocalizationService } from "./services/localization.service";

import { GoogleClient } from "./clients/google.client";

import { UserRepository } from "./database/mongoose/repositories/user.repository";

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
    Container.set('googleClient', new GoogleClient(new LoggerService(), config));
}
