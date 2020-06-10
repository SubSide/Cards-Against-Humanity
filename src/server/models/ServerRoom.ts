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
import { getDefaultSettings } from '../util/SettingsUtils';
import User from '../../common/models/User';
import Role from '../../common/models/Role';

export default class ServerRoom implements Transmissible<Room> {
    private prompts: DrawingDeck<PromptCard> = new DrawingDeck();
    private responses: DrawingDeck<ResponseCard> = new DrawingDeck();
    private czars: DrawingDeck<ServerUser> = new DrawingDeck();
    public settings: Settings = getDefaultSettings();

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
        player.user.leaveRoom();

        // If we don't have any players anymore, we remove ourselves
        if (this.players.length <= 0) {
            this.roomManager.deleteRoom(this);
        } else if (this.owner == player.user) {
            // If the player left is the room owner we change the owner to a random player
            this.owner = this.players[Math.floor(Math.random() * this.players.length)].user;
        }
        
        // Update all other players
        this.sendAllPartialUpdate([], 'players', 'owner');

        // If the player was the czar we skip to next round
        if (this.round.czar == player.user) {
            this.nextRound();
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

        // Increment round number by 1
        this.round.roundNumber += 1;
        // Draw a czar and get a prompt card
        this.round.czar = this.czars.draw().getTransmitData();
        this.round.promptCard = this.prompts.draw(true);

        // Fix all players
        this.players.forEach(player => {
            this.fixPlayer(player);
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

    getListTransmitData(): RoomListItem {
        return {
            id: this.id,
            name: `${this.owner.username}'s Room`,
            maxPlayers: this.settings.maxPlayers,
            players: this.players.map(player => player.getTransmitData()),
            packIds: this.settings.packIds
        }
    }

    createPartialRoom(...props: string[]): PartialRoom {
        let part: PartialRoom = {};
        let whole = this.getTransmitData();
        props.forEach(prop => {
            if (prop in whole) {
                (part as any)[prop] = (whole as any)[prop];
            }
        });

        return part;
    }

    sendAllPartialUpdate(exclude: User[], ...props: string[]) {
        this.sendAllPlayers(new PartialRoomStatePacket(this.createPartialRoom(...props)), exclude);
    }

    sendUpdate() {
        this.sendAllPlayers(new RoomStatePacket(this.getTransmitData()));
    }

    sendAllPlayers(serverPacket: ServerPacket, exclude: User[] = []) {
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