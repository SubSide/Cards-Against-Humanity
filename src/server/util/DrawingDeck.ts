export default class DrawingDeck<T> {
    private discardPile: T[];
    private deck: T[];

    constructor(deck: T[] = []) {
        this.setDeck(deck);
    }

    /**
     * Set a list of items as our deck, clears the discard pile
     * @param items the list of items that our deck will be
     */
    setDeck(items: T[]) {
        this.deck = [...items];
        this.discardPile = [];
    }

    /**
     * Add an item to our deck
     * 
     * @param item the item to add to our deck
     */
    add(item: T) {
        this.deck.push(item)
    }
    
    addToDiscard(item: T) {
        this.discardPile.push(item);
    }

    /**
     * Remove an item from this deck
     * 
     * @param item the item to be removed
     */
    remove(item: T) {
        // We want to remove the item from both decks
        let deckIndex = this.deck.indexOf(item);
        if (deckIndex != -1) this.deck.splice(deckIndex, 1);
        let discardIndex = this.discardPile.indexOf(item);
        if (discardIndex != -1) this.deck.splice(discardIndex, 1);
    }

    /**
     * Here we draw a random item from our pile
     * 
     * @param andDiscard If we also immediately add it to the discard pile
     */
    draw(andDiscard: boolean = false): T {
        // If our deck is empty, replace it with the discard pile and clear the discard pile
        if (this.deck.length < 1) {
            this.deck = this.discardPile;
            this.discardPile = [];
        }

        // Grab (and remove from the deck) a random item
        let item = this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0];

        if (item == null) {
            throw Error("Couldn't draw card. No cards in deck :(");
        }

        // If we want to discard it immediately we do that here, if not we have to do it manually
        if (andDiscard) {
            this.discardPile.push(item);
        }

        return item;
    }
}