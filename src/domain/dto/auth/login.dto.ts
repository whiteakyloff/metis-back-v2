export class LoginDTO {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {}
}