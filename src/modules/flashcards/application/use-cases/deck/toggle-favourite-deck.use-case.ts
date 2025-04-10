import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class ToggleFavouriteDeckUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
    ) {}

    async execute(id: string, userId: string): Promise<Result<{ deck: Deck; message: string }>> {
        try {
            const deck = await this.deckRepository.findBy({ id });

            if (!deck) {
                return Result.failure(this.localizationService.getTextById('DECK_NOT_FOUND'));
            }
            if (deck.ownerId !== userId) {
                return Result.failure(this.localizationService.getTextById('NOT_AUTHORIZED'));
            }
            const updatedDeck = deck.toggleFavourite();
            await this.deckRepository.updateBy({ id }, updatedDeck);

            return Result.success({
                deck: updatedDeck,
                message: this.localizationService.getTextById("TOGGLE_FAVOURITE_DECK_SUCCESS")
            });
        } catch (error) {
            this.logger.error("Failed to toggle favourite status", { error, id });
            return Result.failure(this.localizationService.getTextById('TOGGLE_FAVOURITE_DECK_FAILED'));
        }
    }
}