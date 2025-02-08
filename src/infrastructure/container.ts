import { Container } from "typedi";

import { config } from "@config";

import { MailService } from "./services/mail.service";
import { PasswordHasher } from "./services/hasher.service";
import { LoggerService } from "./services/logger.service";
import { JwtTokenService } from "./services/token.service";
import { UserRepository } from "./database/mongoose/repositories/user.repository";
import { LocalizationService } from "@infrastructure/services/localization.service";

export const setupContainer = () => {
    Container.set('config', config);
    Container.set('logger', new LoggerService());

    Container.set('localizationService', new LocalizationService(config));
    Container.set('passwordHasher', new PasswordHasher());
    Container.set('mailService', new MailService(config));
    Container.set('userRepository', new UserRepository());
    Container.set('tokenService', new JwtTokenService(config));
}