import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Card } from "@modules/flashcards/domain/models/impl.card.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { CardRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/card.repository";
import { DeckRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/deck.repository";

@Service()
export class SearchCardsUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('cardRepository')
        private readonly cardRepository: CardRepository,
        @Inject('deckRepository')
        private readonly deckRepository: DeckRepository,
    ) {}

    async execute(query: string, deckId?: string, userId?: string): Promise<Result<{ cards: Card[]; message: string }>> {
        try {
            if (deckId) {
                const deck = await this.deckRepository.findBy({ id: deckId });

                if (!deck) {
                    return Result.failure(
                        this.localizationService.getTextById('DECK_NOT_FOUND')
                    );
                }
                if (!deck.isPublic && deck.ownerId !== userId) {
                    return Result.failure(
                        this.localizationService.getTextById('NOT_AUTHORIZED')
                    );
                }
            }
            const cards = await this.cardRepository.searchCards(query, deckId);

            if (userId) {
                const deckIds = [...new Set(cards.map(card => card.deckId))];

                const decks = await Promise.all(
                    deckIds.map(id => this.deckRepository.findBy({ id }))
                );
                const deckAccess = new Map();

                decks.forEach(deck => {
                    if (deck) {
                        deckAccess.set(deck.id, deck.isPublic || deck.ownerId === userId);
                    }
                });

                const accessibleCards = cards.filter(card => deckAccess.get(card.deckId));

                return Result.success({
                    cards: accessibleCards,
                    message: this.localizationService.getTextById("CARDS_FOUND", { count: accessibleCards.length.toString() })
                });
            }
            const publicCards = await Promise.all(
                cards.map(async card => {
                    const deck = await this.deckRepository.findBy({
                        id: card.deckId
                    });
                    return { card, isPublic: deck?.isPublic || false };
                })
            );
            const accessibleCards = publicCards
                .filter(item => item.isPublic).map(item => item.card)

            return Result.success({
                cards: accessibleCards,
                message: this.localizationService.getTextById("CARDS_FOUND", { count: accessibleCards.length.toString() })
            });
        } catch (error) {
            this.logger.error("Failed to search cards", { error, query });
            return Result.failure(this.localizationService.getTextById('SEARCH_CARDS_FAILED'));
        }
    }
}