import { Player } from '../../shared/models/Player';
import { WhiteCard } from '../../shared/models/Card';
import { ServerUser } from './ServerUser';
import { ServerRoom } from './ServerRoom';
import { ServerPacketType } from '../../shared/network/ServerPacket';

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

    sendPacket(socket: SocketIO.Server, packet: ServerPacketType) {
        socket.to(this.user.id).send(packet);
    }
}