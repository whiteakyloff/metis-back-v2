export class Result<T> {
    private readonly _isSuccess: boolean;
    private readonly _error?: string;
    private readonly _value?: T;

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        this._isSuccess = isSuccess;
        this._error = error;
        this._value = value;
    }

    public static success<U>(value: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static failure<U>(error: string): Result<U> {
        return new Result<U>(false, error);
    }

    public getValue(): T {
        if (!this._isSuccess) {
            throw new Error('Cannot get value from failure result');
        }
        return this._value!;
    }

    public getError(): string {
        if (this._isSuccess) {
            throw new Error('Cannot get error from success result');
        }
        return this._error!;
    }

    public isSuccess(): boolean {
        return this._isSuccess;
    }

    public isFailure(): boolean {
        return !this._isSuccess;
    }
}