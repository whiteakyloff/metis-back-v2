import { User } from "@modules/auth/domain/models/impl.user.model";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}