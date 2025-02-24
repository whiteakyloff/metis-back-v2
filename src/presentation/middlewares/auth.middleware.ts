import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';

@Service()
@Middleware({ type: 'after' })
export class AuthErrorMiddleware implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction) {
        if (response.headersSent) {
            return next();
        }
        if (request.appError) {
            throw request.appError;
        }
        next();
    }
}