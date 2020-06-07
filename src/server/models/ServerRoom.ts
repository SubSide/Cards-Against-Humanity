import { PromptCard, ResponseCard } from '../../common/models/Card';
import Room from '../../common/models/Room';
import ServerUser from './ServerUser';
import Settings from '../../common/models/Settings';
import ServerPlayer from './ServerPlayer';
import ClientError from '../util/ClientError';
import Transmissible from '../../common/network/Transmissible';
import Round from '../../common/models/Round';
import { RoomStatePacket } from '../../common/network/ServerPackets';
import { RoomListItem, RoomListSettings } from '../../common/network/NetworkModels';
import RoomManager from '../managers/RoomManager';
import { getDefaultSettings } from '../util/SettingsUtils';

export default class ServerRoom implements Transmissible<Room> {
    private prompts: DrawingDeck<PromptCard> = new DrawingDeck();
    private responses: DrawingDeck<ResponseCard> = new DrawingDeck();
    private czars: DrawingDeck<ServerPlayer> = new DrawingDeck();
    private settings: Settings = getDefaultSettings();

    players: ServerPlayer[] = [];
    private round: Round = null;


    constructor(
        public roomManager: RoomManager,
        public id: string,
        public owner: ServerUser
    ) {
        this.join(owner);
    };

    public start() {
        // TODO
        // this.packIds = this.roomManager.cardRetriever.packs.map(pack => pack.id);

        // packs.forEach(pack => {
        //     this.prompts = this.prompts.concat.apply(this.prompts, pack.prompts);
        //     this.responses = this.responses.concat.apply(this.responses, pack.responses);
        // });

        // this.promptDiscardPile = [];
        // this.responseDiscardPile = [];
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
        
        // Send the player an update on the current state
        user.sendUpdateState();

        return player;
    }

    public leave(player: ServerPlayer) {
        // Remove the player from the list of players in this room
        this.players.splice(this.players.indexOf(player), 1);

        // Return all the players' cards to the discard pile
        player.cards.forEach(card => this.responses.add(card));
        
        // Let the player leave the room
        player.user.leaveRoom();

        // If we don't have any players anymore, we remove ourselves
        if (this.players.length <= 0) {
            this.roomManager.deleteRoom(this);
        } else if (this.owner == player.user) {
            // If the player left is the room owner we change the owner to a random player
            this.owner = this.players[Math.floor(Math.random() * this.players.length)].user;
        }
    }

    public nextRound() {
        if (this.round == null) {
            this.round = {
                roundNumber: 0,
                czar: null,
                promptCard: null
            }
        }

        this.round.czar = this.czars.draw().getTransmitData();
        this.round.promptCard = this.prompts.draw(true);
    }

    public fixPlayer(player: ServerPlayer) {
        while (player.cards.length < 10) {
            player.cards.push(this.responses.draw());
        }
    }

    getListTransmitData(): RoomListItem {
        return {
            id: this.id,
            settings: this.getListSettings(),
            playerCount: this.players.length
        }
    }

    getListSettings(): RoomListSettings {
        return {
            name: `${this.owner}'s Room`,
            players: this.players.map(player => player.getTransmitData()),
            packIds: this.settings.packIds
        }
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
    add(item: T, toDiscardInstead: boolean = false) {
        if (toDiscardInstead)
            this.discardPile.push(item);
        else
            this.deck.push(item)
    }

    /**
     * Remove an item from this deck
     * 
     * @param item the item to be removed
     */
    remove(item: T) {
        // We want to remove the item from both decks
        this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0];
        this.discardPile.splice(Math.floor(Math.random() * this.discardPile.length), 1)[0];
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

        // If we want to discard it immediately we do that here, if not we have to do it manually
        if (andDiscard) {
            this.discardPile.push(item);
        }

        return item;
    }
}