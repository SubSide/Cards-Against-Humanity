import { RoomManager } from './managers/RoomManager';
import { CardManager } from './managers/CardManager';
import { PacketHandler } from './managers/PacketHandler';
import { Db } from 'mongodb';
import { ServerUser } from './models/ServerUser';
import { PacketType } from '../shared/network/Packets';

export class GameManager {
    private cardManager: CardManager;
    private roomManager: RoomManager;
    private packetHandler: PacketHandler;

    private users: Map<string, ServerUser>;

    private static PLAYER_TIMEOUT = 5 * 60 * 1000;

    constructor(db: Db) {
        this.cardManager = new CardManager(db);
        this.roomManager = new RoomManager(db);
        this.packetHandler = new PacketHandler();

        this.users = new Map();
    }

    private tick() {
        this.removeInactiveUsers();
    }

    private removeInactiveUsers() {
        let removeUsers: string[] = [];
        let currentTime: number = new Date().getTime();

        this.users.forEach((user, key) => {
            if (user.lastActive !== undefined && user.lastActive < currentTime + GameManager.PLAYER_TIMEOUT) {
                removeUsers.push(key);
            }
        });

        removeUsers.forEach(key =>this.users.delete(key));
    }

    onPacket(socket: SocketIO.Socket, packet: PacketType) {
        if (packet.type === 'socketChange') {
            let user = this.users.get(packet.data);
            if (user !== undefined) {
                user.id = socket.id;
                this.users.delete(packet.data);
                this.users.set(socket.id, user);
            }
            
            return;
        }

        this.packetHandler.incomingPacket(packet);
    }

    onConnect(socket: SocketIO.Socket) {
        this.users.set(socket.id, new ServerUser(socket.id));
    }

    onDisconnect(socket: SocketIO.Socket) {
        let user = this.users.get(socket.id);
        
        if (user != null)
            user.lastActive = new Date().getTime();
    }
}