export class Recovery {
    constructor(
        public readonly email: string,
        public readonly recoveryKey: string,
        public readonly expiresAt: Date,
        public readonly used: boolean
    ) {}

    static create(props: {
        email: string;
        recoveryKey: string;
        expiresAt?: Date;
        used?: boolean;
    }): Recovery {
        return new Recovery(
            props.email,
            props.recoveryKey,
            props.expiresAt ?? new Date(Date.now() + 1800000),
            props.used ?? false
        );
    }
}