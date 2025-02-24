import { User } from "@domain/models/impl.user.model";
import {AppError} from "@infrastructure/errors/app.error";

declare global {
    namespace Express {
        interface Request {
            user?: User;
            appError?: AppError;
        }
    }
}