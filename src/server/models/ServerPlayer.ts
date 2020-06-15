import Player from '../../common/models/Player';
import { ResponseCard } from '../../common/models/Card';
import ServerUser from './ServerUser';
import ServerRoom from './ServerRoom';
import { ServerPacket } from '../../common/network/ServerPackets';
import Transmissible from '../../common/network/Transmissible';

export default class ServerPlayer implements Transmissible<Player> {
    public cards: ResponseCard[];
    public points: number;
    public playedCards: string[];

    constructor(
        public room: ServerRoom,
        public user: ServerUser
    ) {
        this.cards = [];
        this.points = 0;
        this.playedCards = [];
    }

    getTransmitData(): Player {
        return {
            user: this.user.getTransmitData(),
            points: this.points,
            hasPlayedCards: this.playedCards.length != 0,
        }
    }

    canEditRoom(): boolean {
        return this.room.canEdit(this.user);
    }

    sendPacket(packet: ServerPacket) {
        this.user.sendPacket(packet);
    }
}