import { z } from "zod";
import { flashcardSchema } from "../../presentation/validators/flashcards.validator";

export type CreateCardDTO = z.infer<typeof flashcardSchema.createCard>;
export type UpdateCardDTO = z.infer<typeof flashcardSchema.updateCard>;