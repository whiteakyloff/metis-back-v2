import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

import { AppError } from "@infrastructure/errors/app.error";

export const validate = (schema: ZodSchema) => {
    return async(req: Request, _res: Response, next: NextFunction) => {
        try {
            let data = req.body;

            if (!data && req.headers['content-type'] === 'application/json') {
                try {
                    const rawBody = await new Promise<string>((resolve, reject) => {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', () => resolve(body));
                        req.on('error', reject);
                    });

                    data = JSON.parse(rawBody);
                } catch (e) {
                    console.error('Error parsing raw body:', e);
                }
            }
            req.body = await schema.parseAsync(data); next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                next(new AppError(
                    'VALIDATION_ERROR',
                    'Validation failed',
                    400,
                    details
                ));
            } else {
                next(error);
            }
        }
    };
}