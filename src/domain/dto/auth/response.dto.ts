export class ResponseDTO {
    constructor(
        public readonly token: string,
        public readonly message: string,
        public readonly user: {
            id: string; email: string; username: string;
        }
    ) {}
}