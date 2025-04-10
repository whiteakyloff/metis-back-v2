import { Inject, Service } from "typedi";
import { Result } from "@shared/infrastructure/core/result";

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";
import { CreateDeckDTO } from "@modules/flashcards/domain/dto/deck.dto";

import { ILogger } from "@shared/domain/services/impl.logger.service";
import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service()
export class CreateDeckUseCase {
    constructor(
        @Inject('logger')
        private readonly logger: ILogger,
        @Inject('localizationService')
        private readonly localizationService: ILocalizationService,
        @Inject('deckRepository')
        private readonly deckRepository: BaseRepository<Deck>,
    ) {}

    async execute(dto: CreateDeckDTO, userId: string): Promise<Result<{ deck: Deck; message: string }>> {
        try {
            const deck = Deck.create({
                name: dto.name,
                language: dto.language,
                ownerId: userId,
                isPublic: dto.isPublic
            });
            await this.deckRepository.save(deck);

            return Result.success({
                deck,
                message: this.localizationService.getTextById("DECK_CREATED", { deckName: deck.name })
            });
        } catch (error) {
            this.logger.error("Failed to create deck", {
                error
            });
            return Result.failure(this.localizationService.getTextById('DECK_CREATE_FAILED'));
        }
    }
}