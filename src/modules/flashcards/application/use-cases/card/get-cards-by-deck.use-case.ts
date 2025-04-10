import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Card } from "@modules/flashcards/domain/models/impl.card.model";
import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { CardRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/card.repository";

@Service()
export class GetCardsByDeckUseCase {
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

    async execute(deckId: string, userId: string): Promise<Result<{ cards: Card[]; message: string }>> {
        try {
            const deck = await this.deckRepository.findBy({ id: deckId });

            if (!deck) {
                return Result.failure(
                    this.localizationService.getTextById('DECK_NOT_FOUND')
                );
            }
            if (deck.ownerId !== userId && !deck.isPublic) {
                return Result.failure(
                    this.localizationService.getTextById('NOT_AUTHORIZED')
                );
            }
            const cards = await this.cardRepository.findByDeck(deckId);

            return Result.success({
                cards,
                message: this.localizationService.getTextById("CARDS_FOUND", { count: cards.length.toString() })
            });
        } catch (error) {
            this.logger.error("Failed to get cards by deck", { error, deckId });
            return Result.failure(this.localizationService.getTextById('GET_CARDS_FAILED'));
        }
    }
}