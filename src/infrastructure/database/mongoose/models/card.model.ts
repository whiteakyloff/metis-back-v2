import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    _id: String,
    deckId: { type: String, required: true },
    originalWord: { type: String, required: true },
    translatedWord: { type: String, required: true },
    transcription: { type: String, required: true },
    note: { type: String, default: null }
}, { timestamps: true });

// Індекси для пришвидшення пошуку
cardSchema.index({ deckId: 1 });
cardSchema.index({ originalWord: 'text', translatedWord: 'text' });

export const CardModel = mongoose.model('Card', cardSchema);