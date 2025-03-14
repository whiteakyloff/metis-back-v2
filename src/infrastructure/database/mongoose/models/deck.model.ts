import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    language: { type: String, required: true },
    ownerId: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
}, { timestamps: true });

// Індекси для пришвидшення пошуку
deckSchema.index({ ownerId: 1 });
deckSchema.index({ isPublic: 1 });
deckSchema.index({ language: 1 });
deckSchema.index({ name: 'text' });

export const DeckModel = mongoose.model('Deck', deckSchema);