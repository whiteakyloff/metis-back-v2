import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Card } from "@modules/flashcards/domain/models/impl.card.model";
import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";
import { CardRepository } from "@modules/flashcards/infrastructure/database/mongoose/repositories/card.repository";

@Service()
export class GetCardUseCase {
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

    async execute(id: string, userId: string): Promise<Result<{ card: Card; message: string }>> {
        try {
            const card = await this.cardRepository.findBy({ id });

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
            if (deck.ownerId !== userId && !deck.isPublic) {
                return Result.failure(
                    this.localizationService.getTextById('NOT_AUTHORIZED')
                );
            }
            return Result.success({
                card,
                message: this.localizationService.getTextById("CARD_FOUND", { cardName: card.originalWord })
            });
        } catch (error) {
            this.logger.error("Failed to get card", { error, id });
            return Result.failure(this.localizationService.getTextById('GET_CARD_FAILED'));
        }
    }
}