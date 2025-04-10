import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";
import { UpdateDeckDTO } from "@modules/flashcards/domain/dto/deck.dto";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class UpdateDeckUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
    ) {}

    async execute(id: string, body: UpdateDeckDTO, userId: string): Promise<Result<{ deck: Deck; message: string }>> {
        try {
            const { name, language, isPublic, favourite } = body;
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
            const updatedDeck = new Deck(
                deck.id,
                name ?? deck.name,
                language ?? deck.language,
                deck.ownerId,
                isPublic ?? deck.isPublic,
                favourite ?? deck.favourite,
                deck.createdAt, new Date()
            );

            await this.deckRepository.updateBy({ id }, updatedDeck);
            return Result.success({
                deck: updatedDeck,
                message: this.localizationService.getTextById("DECK_UPDATED", { deckName: deck.name }),
            });
        } catch (error) {
            this.logger.error("Failed to update deck", { error, id });
            return Result.failure(this.localizationService.getTextById('UPDATE_DECK_FAILED'));
        }
    }
}