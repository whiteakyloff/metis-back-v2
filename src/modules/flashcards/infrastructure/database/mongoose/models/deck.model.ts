import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    language: { type: String, required: true },
    ownerId: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    favourite: { type: Boolean, default: false },
}, { timestamps: true });

deckSchema.index({ ownerId: 1 });
deckSchema.index({ isPublic: 1 });
deckSchema.index({ language: 1 });
deckSchema.index({ name: 'text' });
deckSchema.index({ favourite: 1 });

export const DeckModel = mongoose.connection.model('Deck', deckSchema);