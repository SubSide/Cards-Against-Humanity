import { RoomManager } from './managers/RoomManager';
import { CardManager } from './managers/CardManager';
import { PacketHandler } from './managers/PacketHandler';
import { Db, Server } from 'mongodb';
import { ServerUser } from './models/ServerUser';
import { ClientPacketType } from '../shared/network/ClientPackets';
import { ErrorPacket } from '../shared/network/ServerPacket';

export class GameManager {
    public cardManager: CardManager;
    public roomManager: RoomManager;
    public packetHandler: PacketHandler;

    private users: Map<string, ServerUser>;

    private static PLAYER_TIMEOUT = 5 * 60 * 1000;

    constructor(db: Db) {
        this.cardManager = new CardManager(db);
        this.roomManager = new RoomManager(db);
        this.packetHandler = new PacketHandler(this);

        this.users = new Map();
    }

    private tick() {
        this.removeInactiveUsers();
    }

    private removeInactiveUsers() {
        let removeUsers: string[] = [];
        let currentTime: number = new Date().getTime();

        this.users.forEach((user, key) => {
            // If we are still connected, we update the users' lastActive time
            if (user.socket?.connected) {
                user.lastActive = currentTime;
            }
            // If not we check if the user timed out and if so add it to our removedUsers list
            else if (user.lastActive < currentTime + GameManager.PLAYER_TIMEOUT) {
                removeUsers.push(key);
            }
        });

        // We delete all users that timed out
        removeUsers.forEach(key =>this.users.delete(key));
    }

    /**
     * This will be called when we receive a packet. If it's a socketChange packet we handle
     * it here accordingly, otherwise we pass it on to the PacketHandler
     * @param socket the socket we received the packet on
     * @param packet the packet we received.
     */
    onPacket(socket: SocketIO.Socket, packet: ClientPacketType) {
        try {
            // The socketChange packet will happen when we create a new socket while we still
            // have an old ID in our cookie. This is so a person can reload the page without
            // getting kicked out of the game. So I hope.
            if (packet.type === 'socketChange') {
                let user = this.users.get(packet.oldId);
                // This automatically makes it fail-safe, if the user doesn't exist, we ignore it.
                if (user !== undefined) {
                    user.id = socket.id;
                    user.socket = socket;
                    this.users.delete(packet.oldId);
                    this.users.set(socket.id, user);
                }
                
                return;
            }
            
            // We get the user
            let user = this.users.get(socket.id);
            if (user === undefined) {
                // If we can't find a user, we send an error
                socket.send(new ErrorPacket('User not found. Try reloading'));
                return;
            }
    
            // TODO debugging
            // We send the packet right back, for debugging purposes
            socket.send(packet);

            // If we found a user we handle it here
            this.packetHandler.incomingPacket(user, packet);
        
        } catch (e) {
            console.warn('Malformed packet received: ', e);
        }
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