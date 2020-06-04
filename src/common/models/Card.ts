export type Card = PromptCard | ResponseCard;

export class PromptCard {
    type: 'prompt' = 'prompt';

    constructor(
        public id: string,
        public text: string,
        public draw: number,
        public pick: number,
    ) {

    }
}

export class ResponseCard {
    type: 'response' = 'response';

    constructor(
        public id: string,
        public text: string
    ) {

    }
}