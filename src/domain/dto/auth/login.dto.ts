export class LoginDTO {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {}
}

export class LoginResponseDTO {
    constructor(
        public readonly token: string,
        public readonly message: string,
        public readonly user: {
            id: string; email: string; username: string;
        }
    ) {}
}