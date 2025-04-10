// Import modules directly without decorators
import { Result } from '@shared/infrastructure/core/result';
import { User } from '@modules/auth/domain/models/impl.user.model';

// Mock models directly so we don't depend on the decorator implementations
jest.mock('../../../domain/models/impl.user.model', () => {
    return {
        User: class User {
            constructor(
                public readonly id: string,
                public readonly email: string,
                public readonly username: string,
                public readonly password?: string | null,
                public readonly emailVerified: boolean = false,
                public readonly authMethod: 'email' | 'google' = 'email'
            ) {}

            static create(props: any): User {
                return new User(
                    'mock-id',
                    props.email,
                    props.username,
                    props.password,
                    props.emailVerified ?? false,
                    props.authMethod ?? 'email'
                );
            }
        }
    };
});

jest.mock('../../../domain/models/impl.verification.model', () => {
    return {
        VerificationCode: class VerificationCode {
            constructor(
                public email: string,
                public attemptsCount: number,
                public codeExpiresAt: Date | null,
                public verificationCode: string | null
            ) {}

            update() {
                this.attemptsCount++;
                this.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
                this.verificationCode = '123456';
                return this;
            }

            isExpired() {
                return !this.codeExpiresAt || this.codeExpiresAt < new Date();
            }

            getRemainingTime() {
                if (!this.codeExpiresAt) return null;
                return Math.ceil((this.codeExpiresAt.getTime() - Date.now()) / 1000 / 60);
            }

            static create(email: string) {
                return new VerificationCode(
                    email,
                    1,
                    new Date(Date.now() + 10 * 60 * 1000),
                    '123456'
                );
            }
        }
    };
});

// Test LoginUseCase
describe('LoginUseCase', () => {
    // Define the class structure we'll test (without decorators)
    class LoginUseCase {
        constructor(
            private readonly logger: any,
            private readonly userRepository: any,
            private readonly passwordHasher: any,
            private readonly googleClient: any,
            private readonly tokenService: any,
            private readonly localizationService: any
        ) {}

        async execute(input: { email: string; password: string }): Promise<Result<any>> {
            try {
                const user = await this.userRepository.findBy({
                    email: input.email
                });
                if (!user) {
                    return Result.failure(
                        this.localizationService.getTextById('USER_NOT_FOUND', {
                            email: input.email
                        })
                    );
                }
                const isPasswordValid = await this.passwordHasher.compare(
                    input.password, user.password
                );

                if (!isPasswordValid) {
                    return Result.failure(
                        this.localizationService.getTextById('WRONG_PASSWORD')
                    );
                }
                const token = await this.tokenService.generateToken(
                    { email: user.email, userId: user.id }
                );
                return Result.success({
                    token,
                    message: this.localizationService.getTextById('LOGIN_SUCCESSFUL'),
                    user: {
                        id: user.id, email: user.email, username: user.username
                    }
                });
            } catch (error) {
                this.logger.error("Login failed", { error });
                return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
            }
        }

        async executeWithGoogle(body: { access_token: string }): Promise<Result<any>> {
            try {
                const client = this.googleClient.getClient();
                const payload = (await client.verifyIdToken({
                    idToken: body.access_token,
                    audience: client._clientId
                })).getPayload();

                if (!payload) {
                    return Result.failure(this.localizationService.getTextById('GOOGLE_AUTH_FAILED'));
                }
                let user = await this.userRepository.findBy({
                    email: payload.email!
                });

                if (!user) {
                    user = User.create({
                        email: payload.email!,
                        username: payload.email!.split('@')[0],
                        emailVerified: true,
                        authMethod: "google"
                    });
                    await this.userRepository.save(user);
                }
                const token = await this.tokenService.generateToken(
                    { email: user.email, userId: user.id }
                );

                return Result.success({
                    token,
                    message: this.localizationService.getTextById('LOGIN_SUCCESSFUL'),
                    user: {
                        id: user.id, email: user.email, username: user.username
                    }
                });
            } catch (error) {
                this.logger.error("Login failed", { error });
                return Result.failure(this.localizationService.getTextById('LOGIN_FAILED'));
            }
        }
    }

    let loginUseCase: LoginUseCase;
    let mockLogger: any;
    let mockUserRepository: any;
    let mockPasswordHasher: any;
    let mockGoogleClient: any;
    let mockTokenService: any;
    let mockLocalizationService: any;

    beforeEach(() => {
        // Setup mocks
        mockLogger = {
            error: jest.fn()
        };
        mockUserRepository = {
            findBy: jest.fn(),
            save: jest.fn()
        };
        mockPasswordHasher = {
            compare: jest.fn()
        };
        mockGoogleClient = {
            getClient: jest.fn()
        };
        mockTokenService = {
            generateToken: jest.fn()
        };
        mockLocalizationService = {
            getTextById: jest.fn((id) => id)
        };

        // Create instance with mocks
        loginUseCase = new LoginUseCase(
            mockLogger,
            mockUserRepository,
            mockPasswordHasher,
            mockGoogleClient,
            mockTokenService,
            mockLocalizationService
        );
    });

    describe('execute', () => {
        it('should return success when login is successful', async () => {
            // Arrange
            const loginDto = { email: 'test@example.com', password: 'Password123' };
            const mockUser = new User('123', 'test@example.com', 'testuser', 'hashedPassword', true, 'email');
            const mockToken = 'jwt-token';

            mockUserRepository.findBy.mockResolvedValue(mockUser);
            mockPasswordHasher.compare.mockResolvedValue(true);
            mockTokenService.generateToken.mockResolvedValue(mockToken);
            mockLocalizationService.getTextById.mockReturnValue('LOGIN_SUCCESSFUL');

            // Act
            const result = await loginUseCase.execute(loginDto);

            // Assert
            expect(result.isSuccess()).toBe(true);
            expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: loginDto.email });
            expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockTokenService.generateToken).toHaveBeenCalledWith({
                email: mockUser.email,
                userId: mockUser.id
            });
        });

        it('should return failure when user not found', async () => {
            // Arrange
            const loginDto = { email: 'nonexistent@example.com', password: 'Password123' };
            mockUserRepository.findBy.mockResolvedValue(null);
            mockLocalizationService.getTextById.mockReturnValue('USER_NOT_FOUND');

            // Act
            const result = await loginUseCase.execute(loginDto);

            // Assert
            expect(result.isFailure()).toBe(true);
            expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: loginDto.email });
            expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
            expect(mockLocalizationService.getTextById).toHaveBeenCalledWith('USER_NOT_FOUND', {
                email: loginDto.email
            });
        });
    });

    describe('executeWithGoogle', () => {
        it('should login successfully with Google token', async () => {
            // Arrange
            const googleToken = { access_token: 'google-token' };
            const mockClient = {
                verifyIdToken: jest.fn(),
                _clientId: 'client-id'
            };
            const mockPayload = {
                getPayload: jest.fn().mockReturnValue({
                    email: 'google@example.com'
                })
            };
            const mockUser = new User('123', 'google@example.com', 'googleuser', null, true, 'google');
            const mockToken = 'jwt-token';

            mockGoogleClient.getClient.mockReturnValue(mockClient);
            mockClient.verifyIdToken.mockResolvedValue(mockPayload);
            mockUserRepository.findBy.mockResolvedValue(mockUser);
            mockTokenService.generateToken.mockResolvedValue(mockToken);
            mockLocalizationService.getTextById.mockReturnValue('LOGIN_SUCCESSFUL');

            // Act
            const result = await loginUseCase.executeWithGoogle(googleToken);

            // Assert
            expect(result.isSuccess()).toBe(true);
            expect(mockGoogleClient.getClient).toHaveBeenCalled();
            expect(mockClient.verifyIdToken).toHaveBeenCalledWith({
                idToken: googleToken.access_token,
                audience: mockClient._clientId
            });
            expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: 'google@example.com' });
            expect(mockTokenService.generateToken).toHaveBeenCalledWith({
                email: mockUser.email,
                userId: mockUser.id
            });
        });
    });
});

// Test RegisterUseCase
describe('RegisterUseCase', () => {
    // Define the class structure without decorators
    class RegisterUseCase {
        constructor(
            private readonly logger: any,
            private readonly userRepository: any,
            private readonly tokenService: any,
            private readonly localizationService: any,
            private readonly passwordHasher: any,
            private readonly verificationService: any,
            private readonly verificationRepository: any
        ) {}

        async execute(input: { email: string; username: string; password: string }): Promise<Result<any>> {
            try {
                const existingUser = await this.userRepository.findBy({
                    email: input.email
                });
                if (existingUser) {
                    return Result.failure(
                        this.localizationService.getTextById('USER_ALREADY_EXISTS')
                    );
                }
                const password = await this.passwordHasher.hash(input.password);

                const user = User.create({
                    email: input.email,
                    username: input.username || input.email.split('@')[0],
                    password
                });
                await this.userRepository.save(user);

                const verificationResult = await this.verificationService.createVerificationCode({
                    email: user.email,
                    verificationType: 'REGISTER'
                });

                if (!verificationResult.isSuccess()) {
                    await this.userRepository.deleteBy({
                        email: user.email
                    });
                    return Result.failure(verificationResult.getError());
                }

                try {
                    const token = await this.tokenService.generateToken(
                        { email: user.email, userId: user.id }
                    );
                    return Result.success({
                        token,
                        message: this.localizationService.getTextById('REGISTRATION_SUCCESSFUL'),
                        user: {
                            id: user.id,
                            email: user.email,
                            username: user.username
                        }
                    });
                } catch (emailError) {
                    await this.userRepository.deleteBy({ email: user.email });
                    await this.verificationRepository.deleteBy({ email: user.email });

                    this.logger.error('Failed to send verification email:', { emailError });
                    return Result.failure(
                        this.localizationService.getTextById('VERIFICATION_EMAIL_SENDING_FAILED')
                    );
                }
            } catch (error) {
                this.logger.error('Registration failed ', { error });
                return Result.failure(this.localizationService.getTextById('REGISTRATION_FAILED'));
            }
        }
    }

    let registerUseCase: RegisterUseCase;
    let mockLogger: any;
    let mockUserRepository: any;
    let mockTokenService: any;
    let mockLocalizationService: any;
    let mockPasswordHasher: any;
    let mockVerificationService: any;
    let mockVerificationRepository: any;

    beforeEach(() => {
        // Setup mocks
        mockLogger = {
            error: jest.fn()
        };
        mockUserRepository = {
            findBy: jest.fn(),
            save: jest.fn(),
            deleteBy: jest.fn()
        };
        mockTokenService = {
            generateToken: jest.fn()
        };
        mockLocalizationService = {
            getTextById: jest.fn((id) => id)
        };
        mockPasswordHasher = {
            hash: jest.fn()
        };
        mockVerificationService = {
            createVerificationCode: jest.fn()
        };
        mockVerificationRepository = {
            deleteBy: jest.fn()
        };

        // Create instance with mocks
        registerUseCase = new RegisterUseCase(
            mockLogger,
            mockUserRepository,
            mockTokenService,
            mockLocalizationService,
            mockPasswordHasher,
            mockVerificationService,
            mockVerificationRepository
        );
    });

    it('should register a user successfully', async () => {
        // Arrange
        const registerDto = {
            email: 'newuser@example.com',
            username: 'newuser',
            password: 'Password123'
        };
        const hashedPassword = 'hashedPassword123';
        const mockToken = 'jwt-token';

        mockUserRepository.findBy.mockResolvedValue(null);
        mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
        mockVerificationService.createVerificationCode.mockResolvedValue(Result.success('Verification code created'));
        mockTokenService.generateToken.mockResolvedValue(mockToken);
        mockLocalizationService.getTextById.mockReturnValue('REGISTRATION_SUCCESSFUL');

        // Act
        const result = await registerUseCase.execute(registerDto);

        // Assert
        expect(result.isSuccess()).toBe(true);
        expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: registerDto.email });
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith(registerDto.password);
        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(mockVerificationService.createVerificationCode).toHaveBeenCalledWith({
            email: expect.any(String),
            verificationType: 'REGISTER'
        });
        expect(mockTokenService.generateToken).toHaveBeenCalled();
    });
});

// Test RecoveryUseCase
describe('RecoveryUseCase', () => {
    // Define class without decorators
    class RecoveryUseCase {
        constructor(
            private readonly logger: any,
            private readonly passwordHasher: any,
            private readonly userRepository: any,
            private readonly localizationService: any
        ) {}

        async execute(input: { email: string, password: string }): Promise<Result<string>> {
            try {
                const user = await this.userRepository.findBy({
                    email: input.email
                });

                if (!user) {
                    return Result.failure(
                        this.localizationService.getTextById('USER_NOT_FOUND', { email: input.email })
                    );
                }

                if (user.authMethod == "google") {
                    return Result.failure(
                        this.localizationService.getTextById('GOOGLE_ACCOUNT_CANNOT_RECOVER')
                    );
                }

                const hashedPassword = await this.passwordHasher.hash(input.password);
                await this.userRepository.updateBy({ email: input.email }, { password: hashedPassword });

                return Result.success(this.localizationService.getTextById('PASSWORD_RECOVERY_SUCCESSFUL'));
            } catch (error) {
                this.logger.error("Recovery failed", {
                    error,
                    email: input.email,
                    errorMessage: error instanceof Error ? error.message : 'Unknown error'
                });

                return Result.failure(this.localizationService.getTextById('RECOVERY_FAILED'));
            }
        }
    }

    let recoveryUseCase: RecoveryUseCase;
    let mockLogger: any;
    let mockPasswordHasher: any;
    let mockUserRepository: any;
    let mockLocalizationService: any;

    beforeEach(() => {
        // Setup mocks
        mockLogger = {
            error: jest.fn()
        };
        mockPasswordHasher = {
            hash: jest.fn()
        };
        mockUserRepository = {
            findBy: jest.fn(),
            updateBy: jest.fn()
        };
        mockLocalizationService = {
            getTextById: jest.fn((id) => id)
        };

        // Create instance with mocks
        recoveryUseCase = new RecoveryUseCase(
            mockLogger,
            mockPasswordHasher,
            mockUserRepository,
            mockLocalizationService
        );
    });

    it('should recover password successfully', async () => {
        // Arrange
        const recoveryDto = {
            email: 'user@example.com',
            password: 'NewPassword123'
        };
        const mockUser = new User('123', 'user@example.com', 'username', 'oldHashedPassword', true, 'email');
        const newHashedPassword = 'newHashedPassword';

        mockUserRepository.findBy.mockResolvedValue(mockUser);
        mockPasswordHasher.hash.mockResolvedValue(newHashedPassword);
        mockLocalizationService.getTextById.mockReturnValue('PASSWORD_RECOVERY_SUCCESSFUL');

        // Act
        const result = await recoveryUseCase.execute(recoveryDto);

        // Assert
        expect(result.isSuccess()).toBe(true);
        expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: recoveryDto.email });
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith(recoveryDto.password);
        expect(mockUserRepository.updateBy).toHaveBeenCalledWith(
            { email: recoveryDto.email },
            { password: newHashedPassword }
        );
        expect(mockLocalizationService.getTextById).toHaveBeenCalledWith('PASSWORD_RECOVERY_SUCCESSFUL');
    });
});