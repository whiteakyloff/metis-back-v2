export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly username: string,
        public readonly password?: string | null,
        public readonly emailVerified: boolean = false,
        public readonly authMethod: 'email' | 'third-party' = 'email'
    ) {}

    static create(props: {
        email: string;
        username: string;
        password?: string | null;
        emailVerified?: boolean;
        authMethod?: 'email' | 'third-party';
    }): User {
        return new User(
            crypto.randomUUID(),
            props.email,
            props.username,
            props.password,
            props.emailVerified ?? false,
            props.authMethod ?? 'email'
        );
    }
}