import { Server } from "socket.io";

import { config } from "@config";
import { Container } from "typedi";

import { UserRepository } from "@modules/auth/infrastructure/database/mongoose/repositories/user.repository";
import { VerificationRepository } from "@modules/auth/infrastructure/database/mongoose/repositories/verification.repository";

import { LocalizationService } from "@modules/shared/infrastructure/services/localization.service";
import { LoggerService } from "@shared/infrastructure/services/logger.service";
import { HasherService } from "@shared/infrastructure/services/hasher.service";
import { JwtTokenService } from "@modules/auth/infrastructure/services/token.service";
import { VerificationService } from "@modules/auth/infrastructure/services/verification.service";
import { MailService } from "@modules/auth/infrastructure/services/mail.service";

import { AppleClient } from "@modules/auth/infrastructure/clients/apple.client";
import { GoogleClient } from "@modules/auth/infrastructure/clients/google.client";
import { BaseClient } from "@shared/domain/clients/base.client";
import { QwenClient } from "@modules/flashcards/infrastructure/clients/qwen.client";
import { ClaudeClient } from "@modules/flashcards/infrastructure/clients/claude.client";
import { LocalizationClient } from "@shared/infrastructure/clients/localization.client";

import { ClientRegistry } from "@shared/domain/clients/client.registry";

import { RegisterUseCase } from "@modules/auth/application/use-cases/register.use-case";
import { LoginUseCase } from "@modules/auth/application/use-cases/login.use-case";
import { RecoveryUseCase } from "@modules/auth/application/use-cases/recovery.use-case";
import {RecoveryRepository} from "@modules/auth/infrastructure/database/mongoose/repositories/recovery.repository";

const clientRegistry = new ClientRegistry();

const register = <T>(token: any, instance: T): T => {
    Container.set(token, instance);

    if (instance instanceof BaseClient) {
        const clientName = token.replace('Client', '');
        clientRegistry.registerClient(clientName, instance as BaseClient<any>);
    }
    return instance;
};

export const setupContainer = () => {
    // Register config and infrastructure
    register('config', config);
    const io = register('socket.io', new Server({ cors: { origin: config.corsOrigin } }));

    // Core services (no dependencies)
    const logger = register('logger', new LoggerService());
    const hasher = register('hasher', new HasherService());

    // Config-dependent services
    const tokenService = register('tokenService', new JwtTokenService(config));
    const localizationService = register('localizationService', new LocalizationService(config));
    const mailService = register('mailService', new MailService(config));

    // Repositories
    const userRepo = register('userRepository', new UserRepository());
    const verificationRepo = register('verificationRepository', new VerificationRepository());
    const recoveryRepo = register('recoveryRepository', new RecoveryRepository());

    // Services with multiple dependencies
    const verificationService = register('verificationService', new VerificationService(
        userRepo, verificationRepo, recoveryRepo, mailService, localizationService
    ));

    // Clients
    register('qwenClient', new QwenClient(config));
    register('claudeClient', new ClaudeClient(config));
    register('localizationClient', new LocalizationClient(localizationService, io));
    register('appleClient', new AppleClient(config, localizationService));
    register('googleClient', new GoogleClient(config, localizationService));

    // Client registry
    register(ClientRegistry, clientRegistry);

    // Use-cases
    register(RecoveryUseCase, new RecoveryUseCase(
        logger, hasher,
        userRepo, localizationService,
        recoveryRepo
    ));
    register(RegisterUseCase, new RegisterUseCase(
        logger, hasher,
        userRepo, tokenService, localizationService,
        verificationRepo, verificationService
    ));
    register(LoginUseCase, new LoginUseCase(
        logger, hasher,
        userRepo, tokenService, localizationService,
        clientRegistry
    ));
};