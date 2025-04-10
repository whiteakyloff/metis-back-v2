import { Service } from 'typedi';

import { Card } from "@modules/flashcards/domain/models/impl.card.model";
import { CardModel } from "../models/card.model";

import { BaseRepository } from "@shared/domain/repositories/base.repository";

@Service('cardRepository')
export class CardRepository extends BaseRepository<Card> {
    async save(card: Card): Promise<void> {
        await CardModel.create({
            _id: card.id, deckId: card.deckId,
            originalWord: card.originalWord,
            translatedWord: card.translatedWord,
            transcription: card.transcription, note: card.note
        });
    }

    async findAll(): Promise<Card[]> {
        const cards = await CardModel.find().lean();
        return cards.map(this.mapToEntity);
    }

    async findBy(filter: Partial<Card>): Promise<Card | null> {
        const card = await CardModel.findOne(filter).lean();
        return card ? this.mapToEntity(card) : null;
    }

    async updateBy(filter: Partial<Card>, entity: Partial<Card>): Promise<void> {
        await CardModel.updateOne(filter, entity).exec();
    }

    async deleteBy(filter: Partial<Card>): Promise<void> {
        await CardModel.deleteOne(filter).exec();
    }

    async findByDeck(deckId: string): Promise<Card[]> {
        const cards = await CardModel.find({ deckId }).lean();
        return cards.map(this.mapToEntity);
    }

    async searchCards(searchTerm: string, deckId?: string): Promise<Card[]> {
        const query: any = { $text: { $search: searchTerm } };
        if (deckId) {
            query.deckId = deckId;
        }
        const cards = await CardModel.find(query).lean();
        return cards.map(this.mapToEntity);
    }

    async bulkSave(cards: Card[]): Promise<void> {
        const documents = cards.map(card => ({
            _id: card.id,
            deckId: card.deckId,
            originalWord: card.originalWord,
            translatedWord: card.translatedWord,
            transcription: card.transcription, note: card.note
        }));

        await CardModel.insertMany(documents);
    }

    private mapToEntity = (doc: any): Card => {
        return new Card(
            doc._id,
            doc.deckId,
            doc.originalWord,
            doc.translatedWord,
            doc.transcription, doc.note
        );
    }
}