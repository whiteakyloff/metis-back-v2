import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Card } from "@modules/flashcards/domain/models/impl.card.model";
import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";
import { CreateCardDTO } from "@modules/flashcards/domain/dto/card.dto";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class CreateCardUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('cardRepository')
        private readonly cardRepository: BaseRepository<Card>,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
    ) {}

    async execute(body: CreateCardDTO, userId: string): Promise<Result<{ card: Card; message: string }>> {
        try {
            const { deckId, originalWord, translatedWord, transcription, note } = body;
            const deck = await this.deckRepository.findBy({ id: deckId });

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
            const card = Card.create({
                deckId,
                originalWord, translatedWord,
                transcription, note
            });

            await this.cardRepository.save(card);
            return Result.success({
                card,
                message: this.localizationService.getTextById("CARD_CREATED", { cardName: card.originalWord })
            });
        } catch (error) {
            this.logger.error("Failed to create card", { error });
            return Result.failure(this.localizationService.getTextById('CARD_CREATE_FAILED'));
        }
    }
}