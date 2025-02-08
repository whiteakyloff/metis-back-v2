import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Container } from 'typedi';

import { ILogger } from "@domain/services/impl.logger.service";
import { AppError } from "@infrastructure/errors/app.error";

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const logger = Container.get<ILogger>('logger');

    logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack, path: req.path,
        method: req.method, timestamp: new Date().toISOString(),
    });

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false, error: {
                code: error.code, message: error.message,
                validationErrors: (error as any).validationErrors,
            },
        });
        return;
    }
    if (error instanceof ZodError) {
        res.status(400).json({
            success: false, error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed', details: error.errors,
            },
        });
        return;
    }
    res.status(500).json({
        success: false, error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error' : error.message,
        },
    });
};