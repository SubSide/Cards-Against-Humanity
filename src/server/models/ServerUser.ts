import { User } from "../../shared/models/User";
import { ServerPlayer } from './ServerPlayer';
import { ClientPacketType } from "../../shared/network/ClientPackets";
import SocketIO from "socket.io";

export class ServerUser implements User, Transmissible {
    public lastActive: number;
    public player?: ServerPlayer;
    public socket?: SocketIO.Socket;

    constructor(
        public id: string,
        public username: string = 'user_' + (Math.random() * 899999999 + 100000000)
    ){
        this.lastActive = 0;
    }

    getTransmitData(): User {
        return {
            username: this.username
        }
    }

    sendPacket(socket: SocketIO.Server, packet: ClientPacketType) {
        socket.to(this.id).send(packet);
    }
}