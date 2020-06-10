import User from "../../common/models/User";
import ServerPlayer from './ServerPlayer';
import SocketIO from "socket.io";
import { UserStateUpdatePacket, ServerPacket, PartialUserStateUpdatePacket } from "../../common/network/ServerPackets";
import Transmissible from '../../common/network/Transmissible';
import Role from "../../common/models/Role";
import Tag from "../../common/models/Tag";
import { PartialOwnState, OwnState } from "../../common/network/NetworkModels";

export default class ServerUser implements Transmissible<User> {
    public lastActive: number = 0;
    public player?: ServerPlayer;
    private cooldowns: Map<string, number> = new Map();
    
    public hash: string = null;
    public tags: Tag[] = [];
    public role: Role = Role.Default

    constructor(
        public id: string,
        public socket: SocketIO.Socket,
        public username: string = 'user_' + Math.floor(Math.random() * 899999999 + 100000000),
    ) {}

    getTransmitData(): User {
        return {
            id: this.id,
            username: this.username,
            hash: this.hash,
            tags: this.tags
        }
    }

    leaveRoom() {
        this.player = null;
        this.sendUpdateState();
    }

    sendPacket(packet: ServerPacket) {
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
            role: this.role,
            room: this.player?.room?.getTransmitData(),
            cards: this.player?.cards,
        }))
    }

    sendPartialUpdate(...props: string[]) {
        let part: PartialOwnState = {};
        let whole = this.createOwnState();
        props.forEach(prop => {
            if (prop in whole) {
                (part as any)[prop] = (whole as any)[prop];
            }
        });

        this.sendPacket(new PartialUserStateUpdatePacket(part));
    }

    createOwnState(): OwnState {
        return {
            user: this.getTransmitData(),
            player: this.player?.getTransmitData(),
            role: this.role,
            room: this.player?.room?.getTransmitData(),
            cards: this.player?.cards,
        }
    }

    
}