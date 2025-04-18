import { Container, Service } from 'typedi';
import { ZodError } from 'zod';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { ILogger } from "@shared/domain/services/impl.logger.service";

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: any) {
        errorHandler(error, request, response, next);
    }
}

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