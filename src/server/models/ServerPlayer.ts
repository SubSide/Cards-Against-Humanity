import { Player } from '../../common/models/Player';
import { ResponseCard } from '../../common/models/Card';
import { ServerUser } from './ServerUser';
import { ServerRoom } from './ServerRoom';
import { ServerPacketType } from '../../common/network/ServerPackets';
import { Transmissible } from '../../common/network/Transmissible';

export class ServerPlayer implements Transmissible<Player> {
    public cards: Response[];
    public points: number;
    public hasPlayedCard: boolean;

    constructor(
        public room: ServerRoom,
        public user: ServerUser
    ) {
        this.cards = [];
        this.points = 0;
        this.hasPlayedCard = false;
    }

    getTransmitData(): Player {
        return {
            user: this.user.getTransmitData(),
            points: this.points,
            hasPlayedCard: this.hasPlayedCard,
        }
    }

    sendPacket(packet: ServerPacketType) {
        this.user.sendPacket(packet);
    }
}