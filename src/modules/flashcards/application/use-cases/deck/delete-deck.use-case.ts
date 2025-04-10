import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { CardRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/card.repository";

@Service()
export class DeleteDeckUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
        @Inject('cardRepository')
        private readonly cardRepository: CardRepository,
    ) {}

    async execute(id: string, userId: string): Promise<Result<string>> {
        try {
            const deck = await this.deckRepository.findBy({ id });

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
            const cards = await this.cardRepository.findByDeck(id);

            for (const card of cards) {
                await this.cardRepository.deleteBy({ id: card.id });
            }
            await this.deckRepository.deleteBy({ id });

            return Result.success(
                this.localizationService.getTextById("DECK_DELETED", { deckName: deck.name })
            );
        } catch (error) {
            this.logger.error("Failed to delete deck", { error, id });
            return Result.failure(this.localizationService.getTextById('DELETE_DECK_FAILED'));
        }
    }
}