import { Container, Service } from "typedi";
import { Authorized, Body, Delete, Get, HttpCode, JsonController, Param, Post, Put, QueryParam } from "routing-controllers";
import { CurrentUser } from "@shared/presentation/decorators/route.decorator";
import { ValidateBody } from "@shared/presentation/middlewares/validation.middleware";

import { User } from "@modules/auth/domain/models/impl.user.model";
import { CreateCardDTO, UpdateCardDTO } from "../../domain/dto/card.dto";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { flashcardSchema } from "../validators/flashcards.validator";

import { CreateCardUseCase } from "../../application/use-cases/card/create-card.use-case";
import { GetCardUseCase } from "../../application/use-cases/card/get-card.use-case";
import { UpdateCardUseCase } from "../../application/use-cases/card/update-card.use-case";
import { DeleteCardUseCase } from "../../application/use-cases/card/delete-card.use-case";
import { GetCardsByDeckUseCase } from "../../application/use-cases/card/get-cards-by-deck.use-case";
import { SearchCardsUseCase } from "../../application/use-cases/card/search-cards.use-case";

@Service()
@JsonController("/cards")
export class CardController
{
    private readonly createCardUseCase = Container.get(CreateCardUseCase);
    private readonly getCardUseCase = Container.get(GetCardUseCase);
    private readonly updateCardUseCase = Container.get(UpdateCardUseCase);
    private readonly deleteCardUseCase = Container.get(DeleteCardUseCase);
    private readonly getCardsByDeckUseCase = Container.get(GetCardsByDeckUseCase);
    private readonly searchCardsUseCase = Container.get(SearchCardsUseCase);

    @Authorized()
    @Post() @HttpCode(201)
    async createCard(
        @CurrentUser() currentUser: User,
        @Body() @ValidateBody(flashcardSchema.createCard) body: CreateCardDTO
    ) {
        const result = await this.createCardUseCase.execute(body, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('CARD_CREATE_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Get("/deck/:deckId") @HttpCode(200)
    async getCardsByDeck(
        @CurrentUser() currentUser: User,
        @Param("deckId") deckId: string
    ) {
        const result = await this.getCardsByDeckUseCase.execute(deckId, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('GET_CARDS_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Get("/:id") @HttpCode(200)
    async getCard(
        @CurrentUser() currentUser: User,
        @Param("id") id: string
    ) {
        const result = await this.getCardUseCase.execute(id, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('GET_CARD_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Put("/:id") @HttpCode(200)
    async updateCard(
        @CurrentUser() currentUser: User,
        @Param("id") id: string,
        @Body() @ValidateBody(flashcardSchema.updateCard) body: UpdateCardDTO
    ) {
        const result = await this.updateCardUseCase.execute(id, body, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('UPDATE_CARD_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Delete("/:id") @HttpCode(200)
    async deleteCard(
        @CurrentUser() currentUser: User,
        @Param("id") id: string
    ) {
        const result = await this.deleteCardUseCase.execute(id, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('DELETE_CARD_FAILED', result.getError(), 400);
    }

    @Get("/search") @HttpCode(200)
    async searchCards(
        @QueryParam("query") query: string,
        @QueryParam("deckId") deckId?: string,
        @CurrentUser() currentUser?: User
    ) {
        const result = await this.searchCardsUseCase.execute(query, deckId, currentUser?.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('SEARCH_CARDS_FAILED', result.getError(), 400);
    }
}