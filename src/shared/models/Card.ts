export type Card = BlackCard | WhiteCard;

export class BlackCard {
    type: 'black';

    constructor(
        public id: string,
        public text: string,
        public requiredCards: number
    ) {

    }
}

export class WhiteCard {
    type: 'white';

    constructor(
        public id: string,
        public text: string
    ) {

    }
}