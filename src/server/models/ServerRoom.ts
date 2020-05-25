import { BlackCard, WhiteCard, Card } from '../../shared/models/Card';
import io from 'socket.io';
import { Room } from '../../shared/models/Room';
import { ServerUser } from './ServerUser';
import { Settings } from '../../shared/models/Settings';
import { ServerPlayer } from './ServerPlayer';
import { Pack } from './Pack';

export class ServerRoom implements Room, Transmissible {
    private blackDiscardPile: BlackCard[];
    private whiteDiscardPile: WhiteCard[];
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

        packs.forEach(pack => {
            this.blackDeck = this.blackDeck.concat.apply(this.blackDeck, pack.blackCards);
            this.whiteDeck = this.whiteDeck.concat.apply(this.whiteDeck, pack.whiteCards);
        });

        this.blackDiscardPile = [];
        this.whiteDiscardPile = [];
    };

    public join(user: ServerUser) {
        if (user.player != null) {
            throw new Error('Already in a room');
        }

        let player = new ServerPlayer(this, user);
        user.player = player;

        this.players.push(player);

        // TODO init player
    }

    public leave(player: ServerPlayer) {
        this.players.splice(this.players.indexOf(player), 1);
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

    getTransmitData(): Room {
        return {
            id: this.id,
            players: this.players.map(player => player.getTransmitData()),
            settings: this.settings
        }
    }
}