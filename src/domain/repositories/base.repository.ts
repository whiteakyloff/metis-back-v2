export abstract class BaseRepository<T> {
    abstract save(entity: T): Promise<void>;

    abstract findAll(): Promise<T[]>;
    abstract findBy(filter: Partial<T>): Promise<T | null>;

    abstract updateBy(filter: Partial<T>, entity: Partial<T>): Promise<void>;
    abstract deleteBy(filter: Partial<T>): Promise<void>;
}