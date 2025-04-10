export class Deck {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly language: string,
        public readonly ownerId: string,
        public readonly isPublic: boolean = false,
        public readonly favourite: boolean = false,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) { } // todo: original language & translation language

    static create(props: {
        name: string; language: string;
        ownerId: string; isPublic?: boolean;
        favourite?: boolean;
    }): Deck {
        return new Deck(
            crypto.randomUUID(),
            props.name, props.language, props.ownerId,
            props.isPublic ?? false,
            props.favourite ?? false
        );
    }

    toggleFavourite(): Deck {
        return new Deck(
            this.id, this.name, this.language,
            this.ownerId, this.isPublic,
            !this.favourite,
            this.createdAt, new Date()
        );
    }
}