import { User } from "../../common/models/User";
import { ServerPlayer } from './ServerPlayer';
import SocketIO from "socket.io";
import { ServerPacketType, UserStateUpdatePacket } from "../../common/network/ServerPackets";
import { Transmissible } from '../../common/network/Transmissible';
import Role from "../../common/models/Role";

export class ServerUser implements Transmissible<User> {
    public lastActive: number;
    public hash: string;
    public player?: ServerPlayer;
    private cooldowns: Map<String, number>;

    constructor(
        public id: string,
        public socket: SocketIO.Socket,
        public username: string = 'user_' + Math.floor(Math.random() * 899999999 + 100000000),
        public role: Role = Role.Default
    ) {
        this.lastActive = 0;
        this.hash = null;
        this.cooldowns = new Map();
    }

    getTransmitData(): User {
        return {
            username: this.username,
            hash: this.hash,
            role: this.role
        }
    }

    leaveRoom() {
        this.player = null;
        this.sendUpdateState();
    }

    sendPacket(packet: ServerPacketType) {
        this.socket.emit(packet.type, packet);
    }

    canDo(text: string, cooldown: number) {
        if (!this.cooldowns.has(text)) {
            this.cooldowns.set(text, 0);
        }

        let currentCooldownTime = this.cooldowns.get(text);
        let currentTime = new Date().getTime();
        this.cooldowns.set(text, currentTime + cooldown);

        return currentCooldownTime < currentTime;
    }

    sendUpdateState() {
        this.sendPacket(new UserStateUpdatePacket({
            user: this.getTransmitData(),
            player: this.player?.getTransmitData(),
            room: this.player?.room?.getTransmitData(),
            cards: this.player?.cards,
        }))
    }
    
}