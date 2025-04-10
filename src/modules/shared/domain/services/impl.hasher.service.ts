export interface IHasher {
    hash(string: string): Promise<string>;

    compare(string: string, hash: string | null | undefined): Promise<boolean>;
}