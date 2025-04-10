import { User } from "@modules/auth/domain/models/impl.user.model";

export class UserInfoDTO {
    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.username = user.username;
        this.emailVerified = user.emailVerified;
        this.authMethod = user.authMethod;
    }

    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
    authMethod: string;

    static fromEntity(user: User): UserInfoDTO {
        return new UserInfoDTO(user);
    }
}