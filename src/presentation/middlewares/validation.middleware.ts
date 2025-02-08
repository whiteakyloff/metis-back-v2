import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from "@infrastructure/errors/app.error";

export const validate = (schema: ZodSchema) => {
    return async(req: Request, _res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body); next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'), message: err.message
                }));

                next(new AppError(
                    'VALIDATION_ERROR',
                    'Validation failed', 400, details
                ));
            } else { next(error) }
        }
    };
}