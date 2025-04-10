import { createParamDecorator } from 'routing-controllers';

import { User } from "@modules/auth/domain/models/impl.user.model";

export interface JwtPayload {
    userId: string; email: string;
}

export function CurrentUser() {
    return createParamDecorator({ value: action => {
            return action.request.user as User;
    }});
}