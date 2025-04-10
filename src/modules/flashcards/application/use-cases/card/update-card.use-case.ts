import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Card } from "@modules/flashcards/domain/models/impl.card.model";
import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";
import { UpdateCardDTO } from "@modules/flashcards/domain/dto/card.dto";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { CardRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/card.repository";

@Service()
export class UpdateCardUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('cardRepository')
        private readonly cardRepository: CardRepository,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
    ) {}

    async execute(id: string, body: UpdateCardDTO, userId: string): Promise<Result<{ card: Card; message: string }>> {
        try {
            const card = await this.cardRepository.findBy({ id });
            const { originalWord, translatedWord, transcription, note } = body;

            if (!card) {
                return Result.failure(
                    this.localizationService.getTextById('CARD_NOT_FOUND')
                );
            }
            const deck = await this.deckRepository.findBy({ id: card.deckId });

            if (!deck) {
                return Result.failure(
                    this.localizationService.getTextById('DECK_NOT_FOUND')
                );
            }
            if (deck.ownerId !== userId) {
                return Result.failure(
                    this.localizationService.getTextById('NOT_AUTHORIZED')
                );
            }
            let updatedCard = card;

            if (originalWord) updatedCard = new Card(
                card.id, card.deckId, originalWord, card.translatedWord,
                card.transcription, card.note, card.createdAt, new Date()
            );
            if (translatedWord) updatedCard = new Card(
                updatedCard.id, updatedCard.deckId, updatedCard.originalWord, translatedWord,
                updatedCard.transcription, updatedCard.note, updatedCard.createdAt, new Date()
            );
            if (transcription) updatedCard = new Card(
                updatedCard.id, updatedCard.deckId, updatedCard.originalWord, updatedCard.translatedWord,
                transcription, updatedCard.note, updatedCard.createdAt, new Date()
            );
            if (note !== undefined) {
                updatedCard = note ? updatedCard.setNote(note) : updatedCard.removeNote();
            }

            await this.cardRepository.updateBy({ id }, updatedCard);
            return Result.success({
                card: updatedCard,
                message: this.localizationService.getTextById("CARD_UPDATED", { cardName: updatedCard.originalWord })
            });
        } catch (error) {
            this.logger.error("Failed to update card", { error, id });
            return Result.failure(this.localizationService.getTextById('UPDATE_CARD_FAILED'));
        }
    }
}