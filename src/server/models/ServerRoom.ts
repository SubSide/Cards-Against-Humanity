import { PromptCard, ResponseCard } from '../../common/models/Card';
import Room, { PartialRoom } from '../../common/models/Room';
import ServerUser from './ServerUser';
import Settings from '../../common/models/Settings';
import ServerPlayer from './ServerPlayer';
import ClientError from '../util/ClientError';
import Transmissible from '../../common/network/Transmissible';
import Round from '../../common/models/Round';
import { ServerPacket, PartialRoomStatePacket, RoomStatePacket } from '../../common/network/ServerPackets';
import { RoomListItem } from '../../common/network/NetworkModels';
import RoomManager from '../managers/RoomManager';
import { getDefaultSettings, areSettingsPleasant, validatedSettings } from '../util/SettingsUtils';
import User from '../../common/models/User';
import Role from '../../common/models/Role';
import CardRetriever from '../db/CardRetriever';

export default class ServerRoom implements Transmissible<Room> {
    private prompts: DrawingDeck<PromptCard> = new DrawingDeck();
    private responses: DrawingDeck<ResponseCard> = new DrawingDeck();
    private czars: DrawingDeck<ServerUser> = new DrawingDeck();
    public settings: Settings = getDefaultSettings();

    players: ServerPlayer[] = [];
    public round: Round = null;


    constructor(
        public roomManager: RoomManager,
        public id: string,
        public owner: ServerUser
    ) {
        this.join(owner);
    };

    public start(cardRetriever: CardRetriever) {
        // Check if the settings are pleasant, will throw errors if not
        // so we don't have to do any if checks
        areSettingsPleasant(cardRetriever, this, this.settings);

        // Create our deck
        let promptCards: PromptCard[] = [];
        let responseCards: ResponseCard[] = [];
        this.settings.packIds.forEach(packId => {
            let pack = this.roomManager.cardRetriever.findPack(packId);
            if (pack == null) throw Error("Something went wrong!");

            promptCards = promptCards.concat(pack.prompts);
            responseCards = responseCards.concat(pack.responses);
        });

        this.prompts.setDeck(promptCards);
        this.responses.setDeck(responseCards);

        // Start the round!
        this.round = null;
        this.nextRound();
    }

    public join(user: ServerUser): ServerPlayer {
        // If the user already has a player object then he's already in a room
        if (user.player != null) {
            throw new ClientError('You can\'t join this room as you\'re already in one!');
        }

        // Create a new ServerPlayer and set the users' player to this object
        let player = new ServerPlayer(this, user);
        user.player = player;

        // Add the player to our player list
        this.players.push(player);
        // And our Czar deck
        this.czars.add(user);

        // If we are already playing, we "fix" the player
        if (this.round != null) {
            this.fixPlayer(player);
        }
        
        // Send the player a complete update on the current state
        user.sendUpdateState();
        
        // Update all other players
        this.sendAllPartialUpdate([user], 'players');

        return player;
    }

    public leave(player: ServerPlayer) {
        // Remove the player from the list of players in this room
        this.players.splice(this.players.indexOf(player), 1);

        // Remove the player from the Czar deck
        this.czars.remove(player.user);

        // Return all the players' cards to the discard pile
        player.cards.forEach(card => this.responses.add(card));
        
        // Let the player leave the room
        player.user.player = null;
        player.user.sendUpdateState();

        // If we don't have any players anymore, we remove ourselves
        if (this.players.length <= 0) {
            this.roomManager.deleteRoom(this);
            return;
        } else if (this.owner == player.user) {
            // If the player left is the room owner we change the owner to a random player
            this.owner = this.players[Math.floor(Math.random() * this.players.length)].user;
        }
        
        // Update all other players
        this.sendAllPartialUpdate([], 'players', 'owner');

        // If the player was the czar we skip to next round
        if (this.round != null && this.round.czar.id == player.user.userId) {
            this.nextRound();
        }
    }

    public userPlaysCards(player: ServerPlayer, cardIds: string[]) {
        if (this.round == null) {
            throw new ClientError("You are trying to play cards while no round is active");
        }

        if (cardIds == null || !Array.isArray(cardIds) || cardIds.length != this.round.promptCard.pick){
            throw new ClientError("You didn't pick the required amount of cards for the prompt card");
        }

        if (this.round.czar.id == player.user.userId) {
            this.czarPlaysCards(player, cardIds[0]);
        } else {
            this.playerPlaysCards(player, cardIds);
        }

    }

    private playerPlaysCards(player: ServerPlayer, cardIds: string[]) {
        if (player.playedCards.length != 0) {
            throw new ClientError("You already played your cards!");
        }

        let cards: ResponseCard[] = [];
        cardIds.forEach(cardId => {
            let card = player.cards.find(card => card.id == cardId);
            if (card == null) {
                throw new ClientError("Don't try playing a card you don't have!! >:(");
            }
            
            cards.push(card);
        });

        // Set the played card
        player.playedCards = cards.map(card => card.id);
        // And update globally
        player.user.updateGlobal();

        // Check the server state
        this.checkState();
    }

    private czarPlaysCards(player: ServerPlayer, cardId: string) {
        if (this.round.cardsChosen == null) {
            throw new ClientError("You can't pick cards yet!");
        }

        if (this.round.winner != null) {
            throw new ClientError("You already picked a winner!");
        }

        var winningPlayer: ServerPlayer = this.players.find(player => {
            return player.cards.find(card => card.id == cardId) != null;
        });

        if (winningPlayer == null) {
            throw new ClientError("Couldn't find a player with these cards!");
        }

        // Set the round winner
        this.round.winner = winningPlayer.user.getTransmitData();

        // Send an update that we picked a winner!
        this.sendUpdate();

        // Now we wait 10(?) seconds and go to next round
        setTimeout(this.nextRound.bind(this), 10000);
    }
    
    public checkState() {
        // Game is not active, ignore!
        if (this.round == null) return;

        if (
            this.players.find(player => 
                this.round.czar.id != player.user.userId
                && (
                    player.playedCards == null
                    || player.playedCards.length == 0
                )
            )
        ) {
            // We found a player that hasn't played a card yet, so we return
            return;
        }

        // Chosen cards are already set!
        if (this.round.cardsChosen != null) return;

        // Set the cards chosen to an array of the players' response cards
        this.round.cardsChosen = this.players
            .filter(player => player.user.userId != this.round.czar.id)
            .map(player => player.getPlayedResponseCards());

        // Update players
        this.sendUpdate();
    }

    public nextRound() {
        if (this.round == null) {
            this.round = {
                roundNumber: 0,
                czar: null,
                promptCard: null,
                cardsChosen: null,
                winner: null
            }
        }

        // Increment round number by 1
        this.round.roundNumber += 1;
        
        // Draw a czar and get a prompt card
        this.round.czar = this.czars.draw(true).getTransmitData();
        let promptCard = this.prompts.draw(true);
        this.round.promptCard = promptCard;

        
        // Here we remove all players their played cards and return it to the deck
        this.players.forEach(player => {
            if (player.playedCards.length > 0) {
                player.playedCards.forEach(playedCard => {
                    // Grab the card
                    let card = player.cards.find(card => card.id == playedCard);
                    if (card != null) {
                        // Return the card to the deck's discard pile
                        this.responses.addToDiscard(card);
                    }
                })
            }
            // And clear the played cards
            player.playedCards = [];
        });


        // Fix all players
        let drawTo = 10 + promptCard.draw;
        this.players.forEach(player => {
            // Fix the player back to 10 cards
            this.fixPlayer(player);

            // sometimes the prompt card requires extra cards to be drawn
            // we do that here
            for (var x = player.cards.length; x < drawTo; x++) {
                player.cards.push(this.responses.draw());
            }

            // Then we send the player its new cards
            player.user.sendPartialUpdate('cards');
        });

        // And send all players an update
        this.sendUpdate();
    }

    public fixPlayer(player: ServerPlayer) {
        while (player.cards.length < 10) {
            player.cards.push(this.responses.draw());
        }
    }

    public updateSettings(updatingUser: ServerUser, newSettings: Settings) {
        // We do setting validation here
        let settings = validatedSettings(this.roomManager.cardRetriever, newSettings);
        if (settings == null) {
            throw new ClientError("Settings were malformed");
        }


        this.settings = newSettings;
        this.sendAllPartialUpdate([updatingUser], 'settings');
    }

    getListTransmitData(): RoomListItem {
        return {
            id: this.id,
            name: `${this.owner.username}'s Room`,
            maxPlayers: this.settings.maxPlayers,
            players: this.players.map(player => player.getTransmitData()),
            packIds: this.settings.packIds
        }
    }

    createPartialRoom(...props: (keyof PartialRoom)[]): PartialRoom {
        let part: PartialRoom = {};
        let whole = this.getTransmitData();
        props.forEach(prop => {
            if (prop in whole) {
                (part as any)[prop] = (whole as any)[prop];
            }
        });

        return part;
    }

    sendAllPartialUpdate(exclude: ServerUser[], ...props: (keyof PartialRoom)[]) {
        this.sendAllPlayers(new PartialRoomStatePacket(this.createPartialRoom(...props)), exclude);
    }

    sendUpdate() {
        this.sendAllPlayers(new RoomStatePacket(this.getTransmitData()));
    }

    sendAllPlayers(serverPacket: ServerPacket, exclude: ServerUser[] = []) {
        this.players.forEach(player => {
            if (exclude.indexOf(player.user) >= 0) {
                return;
            }
            player.sendPacket(serverPacket);
        });
    }

    canEdit(user: ServerUser): boolean {
        return user == this.owner || user.role >= Role.Staff;
    }

    getTransmitData(): Room {
        return {
            id: this.id,
            owner: this.owner.getTransmitData(),
            players: this.players.map(player => player.getTransmitData()),
            round: this.round,
            settings: this.settings
        }
    }

}

class DrawingDeck<T> {
    private discardPile: T[] = [];

    constructor(public deck: T[] = []) {}

    /**
     * Set a list of items as our deck, clears the discard pile
     * @param items the list of items that our deck will be
     */
    setDeck(items: T[]) {
        this.deck = items;
        this.discardPile = [];
    }

    /**
     * Add an item to our deck
     * 
     * @param item the item to add to our deck
     * @param toDiscardInstead if we should add it to our discard pile instead
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