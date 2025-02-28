import { Server } from "socket.io";

import { config } from "@config";
import { Container } from "typedi";

import { LoggerService } from "./services/logger.service";
import { MailService } from "./services/mail.service";
import { PasswordHasher } from "./services/hasher.service";
import { JwtTokenService } from "./services/token.service";
import { LocalizationService } from "./services/localization.service";
import { VerificationService } from "./services/verification.service";

import { GoogleClient } from "./clients/google.client";
import { QwenClient } from "./clients/qwen.client";
import { ClaudeClient } from "./clients/claude.client";
import { LocalizationClient } from "./clients/localization.client";

import { UserRepository } from "./database/mongoose/repositories/user.repository";
import { VerificationRepository } from "./database/mongoose/repositories/verification.repository";

import { RegisterUseCase } from "@application/use-cases/register.use-case";
import { LoginUseCase } from "@application/use-cases/login.use-case";
import { RecoveryUseCase } from "@application/use-cases/recovery.use-case";

export const setupContainer = () => {
    // Main services
    Container.set('config', config);
    Container.set('logger', new LoggerService());
    Container.set('socket.io', new Server({
        cors: { origin: config.corsOrigin }
    }));

    // Repositories
    Container.set('userRepository', new UserRepository());
    Container.set('verificationRepository', new VerificationRepository());

    // Core services
    Container.set('localizationService', new LocalizationService(config));
    Container.set('passwordHasher', new PasswordHasher());
    Container.set('mailService', new MailService(config));
    Container.set('verificationService', new VerificationService(
        Container.get('verificationRepository'),
        Container.get('userRepository'),
        Container.get('mailService'),
        Container.get('localizationService')
    ));
    Container.set('tokenService', new JwtTokenService(config));

    // Clients
    Container.set('googleClient', new GoogleClient(config));
    Container.set('qwenClient', new QwenClient(config));
    Container.set('claudeClient', new ClaudeClient(config));
    Container.set('localizationClient', new LocalizationClient(
        Container.get('localizationService'),
        Container.get('socket.io')
    ));

    // Use cases
    Container.set(RegisterUseCase, new RegisterUseCase(
        Container.get('logger'),
        Container.get('userRepository'),
        Container.get('tokenService'),
        Container.get('localizationService'),
        Container.get('passwordHasher'),
        Container.get('verificationService'),
        Container.get('verificationRepository')
    ));
    Container.set(LoginUseCase, new LoginUseCase(
        Container.get('logger'),
        Container.get('userRepository'),
        Container.get('passwordHasher'),
        Container.get('googleClient'),
        Container.get('tokenService'),
        Container.get('localizationService')
    ));
    Container.set(RecoveryUseCase, new RecoveryUseCase(
        Container.get('logger'),
        Container.get('userRepository'),
        Container.get('verificationService'),
        Container.get('localizationService')
    ))
}
