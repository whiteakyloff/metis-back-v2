import { z } from "zod";

import { authSchema } from "@presentation/validators/auth.validator";

export type RegisterDTO = z.infer<typeof authSchema.register>;

