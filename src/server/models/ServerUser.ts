import { User } from "../../common/models/User";
import { ServerPlayer } from './ServerPlayer';
import SocketIO from "socket.io";
import { ServerPacketType, UserStateUpdatePacket } from "../../common/network/ServerPackets";
import { Transmissible } from '../../common/network/Transmissible';

export class ServerUser implements User, Transmissible {
    public lastActive: number;
    public player?: ServerPlayer;

    constructor(
        public id: string,
        public socket: SocketIO.Socket,
        public username: string = 'user_' + Math.floor(Math.random() * 899999999 + 100000000)
    ){
        this.lastActive = 0;
    }

    getTransmitData(): User {
        return {
            username: this.username
        }
    }

    sendPacket(packet: ServerPacketType) {
        this.socket.emit(packet.type, packet);
    }

    sendUpdateState() {
        this.sendPacket(new UserStateUpdatePacket(
            this.getTransmitData(),
            this.player?.game?.getTransmitData()
        ))
    }
}