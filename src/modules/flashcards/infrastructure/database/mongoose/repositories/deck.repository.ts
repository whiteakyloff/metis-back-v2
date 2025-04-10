import { Service } from 'typedi';

import { Deck } from "@modules/flashcards/domain/models/impl.deck.model";
import { DeckModel } from "../models/deck.model";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service('deckRepository')
export class DeckRepository extends BaseRepository<Deck> {
    async save(deck: Deck): Promise<void> {
        await DeckModel.create({
            _id: deck.id, name: deck.name,
            language: deck.language,
            ownerId: deck.ownerId, isPublic: deck.isPublic,
            favourite: deck.favourite
        });
    }

    async findAll(): Promise<Deck[]> {
        const decks = await DeckModel.find().lean();
        return decks.map(this.mapToEntity);
    }

    async findBy(filter: Partial<Deck>): Promise<Deck | null> {
        const deck = await DeckModel.findOne(filter).lean();
        return deck ? this.mapToEntity(deck) : null;
    }

    async updateBy(filter: Partial<Deck>, entity: Partial<Deck>): Promise<void> {
        await DeckModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<Deck>): Promise<void> {
        await DeckModel.deleteOne(filter).exec();
    }

    async findByOwner(ownerId: string): Promise<Deck[]> {
        const decks = await DeckModel.find({ ownerId }).lean();
        return decks.map(this.mapToEntity);
    }

    async findPublicDecks(language?: string): Promise<Deck[]> {
        const query = { isPublic: true };

        if (language) {
            Object.assign(query, { language });
        }
        const decks = await DeckModel.find(query).lean();
        return decks.map(this.mapToEntity);
    }

    async searchDecks(searchTerm: string, ownerId?: string): Promise<Deck[]> {
        const query: any = { $text: { $search: searchTerm } };
        if (ownerId) {
            query.ownerId = ownerId;
        }
        const decks = await DeckModel.find(query).lean();
        return decks.map(this.mapToEntity);
    }

    private mapToEntity = (doc: any): Deck => {
        return new Deck(
            doc._id, doc.name,
            doc.language,
            doc.ownerId, doc.isPublic,
            doc.favourite || false
        );
    }
}