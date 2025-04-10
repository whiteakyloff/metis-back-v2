import { z } from "zod";

export const flashcardSchema = {
    createCard: z.object({
        deckId: z.string().uuid(),
        originalWord: z.string().min(1, "Original word is required"),
        translatedWord: z.string().min(1, "Translated word is required"),
        transcription: z.string(),
        note: z.string().nullable().optional()
    }),

    updateCard: z.object({
        originalWord: z.string().min(1, "Original word is required").optional(),
        translatedWord: z.string().min(1, "Translated word is required").optional(),
        transcription: z.string().optional(),
        note: z.string().nullable().optional()
    }),

    createDeck: z.object({
        name: z.string().min(1, "Deck name is required"),
        language: z.string().min(1, "Language is required"),
        isPublic: z.boolean().default(false)
    }),

    updateDeck: z.object({
        name: z.string().min(1, "Deck name is required").optional(),
        language: z.string().min(1, "Language is required").optional(),
        isPublic: z.boolean().optional(), favourite: z.boolean().optional()
    })
};