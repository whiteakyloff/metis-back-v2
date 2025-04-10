import { z } from "zod";
import { authSchema } from "../../presentation/validators/auth.validator";

export type RecoveryDTO = z.infer<typeof authSchema.recovery>;

export class RecoveryResponseDTO {
    constructor(
        public readonly message: string,
        public readonly recoveryKey: string
    ) {}
}