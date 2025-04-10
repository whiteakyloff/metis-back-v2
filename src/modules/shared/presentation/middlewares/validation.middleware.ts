import { createParamDecorator } from 'routing-controllers';
import { ZodSchema } from 'zod';

import { AppError } from "@shared/infrastructure/errors/app.error";

export function ValidateBody(schema: ZodSchema) {
    return createParamDecorator({
        required: true,
        value: action => {
            if (!action.request.body) {
                throw new AppError('VALIDATION_ERROR', 'Request body is required', 400);
            }
            const result = schema.safeParse(action.request.body);

            if (!result.success) {
                const details = result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                throw new AppError('VALIDATION_ERROR', 'Validation failed', 400, details);
            }
            return result.data;
        },
    });
}