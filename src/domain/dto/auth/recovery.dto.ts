import { z } from "zod";
import { authSchema } from "@presentation/validators/auth.validator";

export type RecoveryDTO = z.infer<typeof authSchema.recovery>;