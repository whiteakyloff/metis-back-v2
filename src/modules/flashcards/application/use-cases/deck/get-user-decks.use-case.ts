import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { DeckRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/deck.repository";

@Service()
export class GetUserDecksUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: DeckRepository,
    ) {}

    async execute(userId: string): Promise<Result<{ decks: Deck[]; message: string }>> {
        try {
            const decks = await this.deckRepository.findByOwner(userId);

            return Result.success({
                decks,
                message: this.localizationService.getTextById("DECKS_FOUND", { count: decks.length.toString() })
            });
        } catch (error) {
            this.logger.error("Failed to get user decks", { error, userId });
            return Result.failure(this.localizationService.getTextById('GET_DECKS_FAILED'));
        }
    }
}