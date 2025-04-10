import { Container, Service } from "typedi";
import { Authorized, Body, Delete, Get, HttpCode, JsonController, Param, Post, Put, QueryParam } from "routing-controllers";
import { CurrentUser } from "@shared/presentation/decorators/route.decorator";
import { ValidateBody } from "@shared/presentation/middlewares/validation.middleware";

import { User } from "@modules/auth/domain/models/impl.user.model";
import { CreateDeckDTO, UpdateDeckDTO } from "../../domain/dto/deck.dto";

import { AppError } from "@shared/infrastructure/errors/app.error";
import { flashcardSchema } from "../validators/flashcards.validator";

import { CreateDeckUseCase } from "../../application/use-cases/deck/create-deck.use-case";
import { GetUserDecksUseCase } from "../../application/use-cases/deck/get-user-decks.use-case";
import { GetPublicDecksUseCase } from "../../application/use-cases/deck/get-public-decks.use-case";
import { UpdateDeckUseCase } from "../../application/use-cases/deck/update-deck.use-case";
import { DeleteDeckUseCase } from "../../application/use-cases/deck/delete-deck.use-case";
import { GetDeckUseCase } from "../../application/use-cases/deck/get-deck.use-case";
import { SearchDecksUseCase } from "../../application/use-cases/deck/search-decks.use-case";
import { ToggleFavouriteDeckUseCase } from "../../application/use-cases/deck/toggle-favourite-deck.use-case";

@Service()
@JsonController("/decks")
export class DeckController
{
    private readonly createDeckUseCase = Container.get(CreateDeckUseCase);
    private readonly getUserDecksUseCase = Container.get(GetUserDecksUseCase);
    private readonly getPublicDecksUseCase = Container.get(GetPublicDecksUseCase);
    private readonly updateDeckUseCase = Container.get(UpdateDeckUseCase);
    private readonly deleteDeckUseCase = Container.get(DeleteDeckUseCase);
    private readonly getDeckUseCase = Container.get(GetDeckUseCase);
    private readonly searchDecksUseCase = Container.get(SearchDecksUseCase);
    private readonly toggleFavouriteDeckUseCase = Container.get(ToggleFavouriteDeckUseCase);

    @Authorized()
    @Post() @HttpCode(201)
    async createDeck(
        @CurrentUser() currentUser: User,
        @Body() @ValidateBody(flashcardSchema.createDeck) body: CreateDeckDTO
    ) {
        const result = await this.createDeckUseCase.execute(body, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('DECK_CREATE_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Get("/my") @HttpCode(200)
    async getUserDecks(
        @CurrentUser() currentUser: User
    ) {
        const result = await this.getUserDecksUseCase.execute(currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('GET_DECKS_FAILED', result.getError(), 400);
    }

    @Get("/public") @HttpCode(200)
    async getPublicDecks(
        @QueryParam("language") language: string
    ) {
        const result = await this.getPublicDecksUseCase.execute(language);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('GET_PUBLIC_DECKS_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Get("/:id") @HttpCode(200)
    async getDeck(
        @CurrentUser() currentUser: User,
        @Param("id") id: string
    ) {
        const result = await this.getDeckUseCase.execute(id, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('GET_DECK_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Put("/:id") @HttpCode(200)
    async updateDeck(
        @CurrentUser() currentUser: User,
        @Param("id") id: string,
        @Body() @ValidateBody(flashcardSchema.updateDeck) body: UpdateDeckDTO
    ) {
        const result = await this.updateDeckUseCase.execute(id, body, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('UPDATE_DECK_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Delete("/:id") @HttpCode(200)
    async deleteDeck(
        @CurrentUser() currentUser: User,
        @Param("id") id: string
    ) {
        const result = await this.deleteDeckUseCase.execute(id, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: { message: result.getValue() }
            };
        }
        throw new AppError('DELETE_DECK_FAILED', result.getError(), 400);
    }

    @Get("/search") @HttpCode(200)
    async searchDecks(
        @QueryParam("query") query: string,
        @CurrentUser() currentUser?: User
    ) {
        const result = await this.searchDecksUseCase.execute(query, currentUser?.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('SEARCH_DECKS_FAILED', result.getError(), 400);
    }

    @Authorized()
    @Put("/:id/favourite") @HttpCode(200)
    async toggleFavouriteDeck(
        @CurrentUser() currentUser: User,
        @Param("id") id: string
    ) {
        const result = await this.toggleFavouriteDeckUseCase.execute(id, currentUser.id);

        if (result.isSuccess()) {
            return {
                success: true,
                data: result.getValue()
            };
        }
        throw new AppError('TOGGLE_FAVOURITE_DECK_FAILED', result.getError(), 400);
    }
}