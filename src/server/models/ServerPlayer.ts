import { Player, PlayerState } from '../../common/models/Player';
import { WhiteCard } from '../../common/models/Card';
import { ServerUser } from './ServerUser';
import { ServerRoom } from './ServerRoom';
import { ServerPacketType } from '../../common/network/ServerPackets';
import { Transmissible } from '../../common/network/Transmissible';

export class ServerPlayer implements Player, Transmissible {
    public cards: WhiteCard[];
    public points: number;

    constructor(
        public game: ServerRoom,
        public user: ServerUser
    ) {
        this.cards = [];
        this.points = 0;
    }

    getTransmitData(): Player {
        return {
            user: this.user.getTransmitData(),
            points: this.points
        }
    }

    getPlayerState(): PlayerState {
        return {
            player: this.getTransmitData(),
            cards: this.cards
        }
    }

    sendPacket(packet: ServerPacketType) {
        this.user.sendPacket(packet);
    }
}