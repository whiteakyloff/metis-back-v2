import { User } from "@domain/models/impl.user.model";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}