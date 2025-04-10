import { Result } from "@shared/infrastructure/core/result";

export abstract class BaseClient<T> {
    abstract getBase(): T;

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}

export abstract class BaseAIClient<T> extends BaseClient<T> {
    abstract doRequest(text: string): Promise<string | null>;
}

export abstract class BaseAuthClient<T> extends BaseClient<T> {
    abstract verifyToken(token: string): Promise<Result<any>>;
}