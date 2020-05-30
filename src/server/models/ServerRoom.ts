import { BlackCard, WhiteCard, Card } from '../../shared/models/Card';
import io from 'socket.io';
import { Room, RoomListItem } from '../../shared/models/Room';
import { ServerUser } from './ServerUser';
import { Settings, RoomListSettings } from '../../shared/models/Settings';
import { ServerPlayer } from './ServerPlayer';
import { Pack } from './Pack';
import ClientError from '../util/ClientError';

export class ServerRoom implements Room, Transmissible {
    private blackDiscardPile: BlackCard[];
    private whiteDiscardPile: WhiteCard[];
    private packIds: string[];
    private blackDeck: BlackCard[];
    private whiteDeck: WhiteCard[];

    players: ServerPlayer[];
    owner: ServerPlayer;

    constructor(
        public id: string,
        packs: Pack[],
        public settings: Settings = {}
    ) {
        this.players = [];

        this.blackDeck = [];
        this.whiteDeck = [];

        this.packIds = packs.map(pack => pack.id);

        packs.forEach(pack => {
            this.blackDeck = this.blackDeck.concat.apply(this.blackDeck, pack.blackCards);
            this.whiteDeck = this.whiteDeck.concat.apply(this.whiteDeck, pack.whiteCards);
        });

        this.blackDiscardPile = [];
        this.whiteDiscardPile = [];
    };

    public join(user: ServerUser): ServerPlayer {
        if (user.player != null) {
            throw new ClientError('You can\'t join this room as you\'re already in one!');
        }

        let player = new ServerPlayer(this, user);
        user.player = player;

        this.players.push(player);

        return player;

        // TODO init player
    }

    public leave(player: ServerPlayer) {
        this.players.splice(this.players.indexOf(player), 1);
        player.user.player = null;
    }

    public drawCard(): WhiteCard {
        if (this.whiteDeck.length < 1) {
            this.whiteDeck = this.whiteDiscardPile;
            this.whiteDeck = [];
        }

        // Get random card from deck
        let card = this.whiteDeck.splice(Math.floor(Math.random() * this.whiteDeck.length), 1)[0];    
        return card;
    }

    public drawBlackCard(): BlackCard {
        if (this.blackDeck.length < 1) {
            this.blackDeck = this.blackDiscardPile;
            this.blackDeck = [];
        }

        // Get random card from deck
        let card = this.blackDeck.splice(Math.floor(Math.random() * this.blackDeck.length), 1)[0];    
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