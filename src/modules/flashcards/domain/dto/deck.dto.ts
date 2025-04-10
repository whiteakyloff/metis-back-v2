import { z } from "zod";
import { flashcardSchema } from "../../presentation/validators/flashcards.validator";

export type CreateDeckDTO = z.infer<typeof flashcardSchema.createDeck>;
export type UpdateDeckDTO = z.infer<typeof flashcardSchema.updateDeck>;