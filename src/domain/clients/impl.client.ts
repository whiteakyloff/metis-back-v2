export abstract class BaseClient<T> {
    abstract getBase(): T;

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
}

export abstract class BaseAIClient<T> extends BaseClient<T> {
    abstract doRequest(text: string): Promise<string | null>;
}