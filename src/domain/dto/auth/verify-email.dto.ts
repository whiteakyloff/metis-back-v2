import { z } from "zod";
import { authSchema } from "@presentation/validators/auth.validator";

export type VerifyEmailDTO = z.infer<typeof authSchema.verifyEmail>;
