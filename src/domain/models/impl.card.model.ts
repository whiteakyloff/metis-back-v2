export class Card {
    constructor(
        public readonly id: string,
        public readonly deckId: string,
        public readonly originalWord: string,
        public readonly translatedWord: string,
        public readonly transcription: string,
        public readonly note: string | null = null,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}

    static create(props: {
        deckId: string;
        originalWord: string;
        translatedWord: string;
        transcription: string;
        note?: string | null;
    }): Card {
        return new Card(
            crypto.randomUUID(),
            props.deckId,
            props.originalWord,
            props.translatedWord,
            props.transcription,
            props.note ?? null,
            new Date(), new Date()
        );
    }

    setNote(note: string): Card {
        return new Card(
            this.id, this.deckId,
            this.originalWord,
            this.translatedWord, this.transcription,
            note, this.createdAt, new Date()
        );
    }

    removeNote(): Card {
        return new Card(
            this.id, this.deckId,
            this.originalWord,
            this.translatedWord, this.transcription,
            null, this.createdAt, new Date()
        );
    }
}