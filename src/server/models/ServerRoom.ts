import { PromptCard, ResponseCard, Card } from '../../common/models/Card';
import io from 'socket.io';
import { Room } from '../../common/models/Room';
import { ServerUser } from './ServerUser';
import { Settings } from '../../common/models/Settings';
import { ServerPlayer } from './ServerPlayer';
import { Pack } from './Pack';
import ClientError from '../util/ClientError';
import { RoomJoinedPacket } from '../../common/network/ServerPackets';
import { Transmissible } from '../../common/network/Transmissible';
import { Round } from '../../common/models/Round';
import { RoomListItem, RoomListSettings } from '../../common/network/NetworkModels';
import { GameManager } from '../GameManager';
import { RoomManager } from '../managers/RoomManager';

export class ServerRoom implements Transmissible<Room> {
    private promptDiscardPile: PromptCard[];
    private responseDiscardPile: ResponseCard[];
    private packIds: string[];
    private prompts: PromptCard[];
    private responses: ResponseCard[];

    players: ServerPlayer[];
    owner: ServerPlayer;
    round: Round;

    constructor(
        public roomManager: RoomManager,
        public id: string,
        packs: Pack[],
        public settings: Settings = {}
    ) {
        this.players = [];

        this.prompts = [];
        this.responses = [];

        this.round = null;

        this.packIds = packs.map(pack => pack.id);

        packs.forEach(pack => {
            this.prompts = this.prompts.concat.apply(this.prompts, pack.prompts);
            this.responses = this.responses.concat.apply(this.responses, pack.responses);
        });

        this.promptDiscardPile = [];
        this.responseDiscardPile = [];
    };

    public join(user: ServerUser): ServerPlayer {
        if (user.player != null) {
            throw new ClientError('You can\'t join this room as you\'re already in one!');
        }

        let player = new ServerPlayer(this, user);
        user.player = player;

        this.players.push(player);
        this.fixPlayer(player);
        
        // Send the player the packet about that he joined
        player.sendPacket(new RoomJoinedPacket(this.getTransmitData()));
        
        // Send the player an update on the current state
        user.sendUpdateState();

        return player;
    }

    public leave(player: ServerPlayer) {
        // Remove the player from the list of players in this room
        this.players.splice(this.players.indexOf(player), 1);

        // Return all the players' cards to the discard pile
        player.cards.forEach(card => this.responseDiscardPile.push(card));
        
        // Let the player leave the room
        player.user.leaveRoom();

        // If we don't have any players anymore, we remove ourselves
        if (this.players.length <= 0) {
            this.roomManager.deleteRoom(this);
        }
    }

    public drawCard(): ResponseCard {
        if (this.responses.length < 1) {
            this.responses = this.responseDiscardPile;
            this.responses = [];
        }

        // Get random card from deck
        let card = this.responses.splice(Math.floor(Math.random() * this.responses.length), 1)[0];
        return card;
    }

    public nextRound() {

    }

    public fixPlayer(player: ServerPlayer) {
        while (player.cards.length < 10) {
            player.cards.push(this.drawCard());
        }
    }

    public drawPromptCard(): PromptCard {
        if (this.prompts.length < 1) {
            this.prompts = this.promptDiscardPile;
            this.prompts = [];
        }

        // Get random card from deck
        let card = this.prompts.splice(Math.floor(Math.random() * this.prompts.length), 1)[0];    
        return card;
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
            name: this.settings.name || 'Error',
            maxPlayers: this.settings.maxPlayers || 8,
            packIds: this.packIds,
            hasCustomCards: false
        }
    }

    getTransmitData(): Room {
        return {
            id: this.id,
            players: this.players.map(player => player.getTransmitData()),
            settings: this.settings
        }
    }
}