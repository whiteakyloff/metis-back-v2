export class AppError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number,
        public readonly validationErrors?: Array<{ field: string; message: string }>
    ) {
        super(message);
        this.name = 'AppError';
    }
}