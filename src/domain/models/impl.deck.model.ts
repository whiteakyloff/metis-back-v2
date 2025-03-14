export class Deck {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly language: string,
        public readonly ownerId: string,
        public readonly isPublic: boolean = false,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}

    static create(props: {
        name: string; language: string;
        ownerId: string; isPublic?: boolean;
    }): Deck {
        return new Deck(
            crypto.randomUUID(),
            props.name, props.language, props.ownerId, props.isPublic ?? false
        );
    }
}