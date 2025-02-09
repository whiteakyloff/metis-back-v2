export interface IClient {
    connect(): Promise<void>;

    disconnect(): Promise<void>;
}

export interface IAIClient extends IClient {
    doRequest(text: string): Promise<string | null>
}