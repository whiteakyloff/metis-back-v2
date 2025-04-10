import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { DeckRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/deck.repository";

@Service()
export class SearchDecksUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: DeckRepository,
    ) {}

    async execute(query: string, userId?: string): Promise<Result<{ decks: Deck[]; message: string }>> {
        try {
            let decks = await this.deckRepository.searchDecks(query);

            if (!userId) {
                decks = decks.filter(deck => deck.isPublic); // Return only public decks if no userId is provided

                return Result.success({
                    decks,
                    message: this.localizationService.getTextById("DECKS_FOUND", { count: decks.length.toString() })
                });
            } else {
                decks = decks.filter(deck => deck.isPublic || deck.ownerId === userId); // Return decks that are public or owned by the user

                return Result.success({
                    decks,
                    message: this.localizationService.getTextById("DECKS_FOUND", { count: decks.length.toString() })
                });
            }
        } catch (error) {
            this.logger.error("Failed to search decks", { error, query });
            return Result.failure(this.localizationService.getTextById('SEARCH_DECKS_FAILED'));
        }
    }
}