export interface ILogger {
    /**
     * Log error message
     * @param message - Error message to log
     * @param meta - Optional metadata to include with the log
     */
    error(message: string, meta?: any): void;

    /**
     * Log warning message
     * @param message - Warning message to log
     * @param meta - Optional metadata to include with the log
     */
    warn(message: string, meta?: any): void;

    /**
     * Log info message
     * @param message - Info message to log
     * @param meta - Optional metadata to include with the log
     */
    info(message: string, meta?: any): void;

    /**
     * Log debug message
     * @param message - Debug message to log
     * @param meta - Optional metadata to include with the log
     */
    debug(message: string, meta?: any): void;
}