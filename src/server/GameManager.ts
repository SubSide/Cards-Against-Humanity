import RoomManager from './managers/RoomManager';
import PacketHandler from './managers/PacketHandler';
import { Db } from 'mongodb';
import ServerUser from './models/ServerUser';
import { ErrorPacket, ServerStatePacket } from '../common/network/ServerPackets';
import ClientError from './util/ClientError';
import Pair from '../common/utils/Pair';
import UserRetriever from './db/UserRetriever';

export default class GameManager {
    public roomManager: RoomManager;
    public packetHandler: PacketHandler;
    public userRetriever: UserRetriever;

    private users: Map<string, ServerUser>;

    private static PLAYER_TIMEOUT = 5 * 60 * 1000;

    constructor(db: Db, serverIO: SocketIO.Server) {
        this.roomManager = new RoomManager(db);
        this.packetHandler = new PacketHandler(this);
        this.userRetriever = new UserRetriever(db);

        this.users = new Map();
        setInterval(this.tick.bind(this), 15000);
    }

    /**
     * Called every 15 seconds. Currently only used for removing inactive users.
     */
    private tick() {
        this.removeInactiveUsers();
    }

    /**
     * This is called every 15 seconds to check if there are inactive players.
     * Players get disconnected after 5 minutes (might change later).
     */
    private removeInactiveUsers() {
        let removeUsers: Pair<string, ServerUser>[] = [];
        let currentTime: number = new Date().getTime();

        this.users.forEach((user, key) => {
            // If we are still connected, we update the users' lastActive time
            if (user.socket?.connected) {
                user.lastActive = currentTime;
            }
            // If not we check if the user timed out and if so add it to our removedUsers list
            else if (user.lastActive < currentTime - GameManager.PLAYER_TIMEOUT) {
                removeUsers.push(new Pair(key, user));
            }
        });

        // We delete all users that timed out
        removeUsers.forEach(pair => {
            console.debug(`Removed '${pair.value.username}' due to inactivity.`);
            this.users.delete(pair.key);
            
            let player = pair.value?.player;
            // Remove the player from the game if he is in any
            if (player != null) {
                player.room.leave(player);
            }
        });
    }

    /**
     * This will be called when we receive a packet. If it's a socketChange packet we handle
     * it here accordingly, otherwise we pass it on to the PacketHandler
     * @param socket the socket we received the packet on
     * @param packet the packet we received.
     */
    onPacket(socket: SocketIO.Socket, packet: any) {
        try {
            if (packet == undefined || !('type' in packet)) {
                throw new ClientError('Invalid packet sent');
            }
            // The socketChange packet will happen when we create a new socket while we still
            // have an old ID in our cookie. This is so a person can reload the page without
            // getting kicked out of the game. So I hope.
            if (packet.type === 'socketChange') {
                let user = this.users.get(packet.oldId);
                // This automatically makes it fail-safe, if the user doesn't exist, we ignore it.
                if (user !== undefined) {
                    user.socketId = socket.id; // Update the id
                    user.socket = socket; // Update the socket
                    this.users.delete(packet.oldId); // delete the user from the old id
                    this.users.set(socket.id, user); // Set the user to the new id
                    console.debug(`Succesfully changed Socket ID for user '${user.username}'. From '${packet.oldId}' to '${socket.id}'`);
                    // Send an update state so the user is back up to speed on where it was.
                    user.sendUpdateState();
                }
                return;
            }
            
            // We get the user
            let user = this.users.get(socket.id);
            if (user === undefined) {
                // If we can't find a user, we send an error
                throw Error('User not found. Try reloading.');
            }

            // If we found a user we handle it in the packetHandler
            this.packetHandler.incomingPacket(user, packet);
        
        } catch (e) {
            // If the error is of type ClientError we just want to know the client about it
            // This is because we use ClientError explicitly if it is a known and deliberate error.
            if ('name' in e && e.name == 'ClientError') {
                socket.emit('errorPacket', new ErrorPacket(e.message));
                return;
            }
            
            // It is not of type ClientError, there might be something else going on. Let's throw it in console.
            console.warn('Malformed packet received: '+ e?.message, e);
            socket.emit('errorPacket', new ErrorPacket('An unknown error ocurred. If the error persists first try reloading, then try opening this page in a new tab.'));
            
        }
    }

    /**
     * This is called when a new connection is made to the server
     * 
     * @param socket the connecting socket 
     */
    onConnect(socket: SocketIO.Socket) {
        let newUser = new ServerUser(socket.id, socket);
        this.users.set(socket.id, newUser);
        console.debug(`New user '${newUser.username}' connected with id: ${newUser.userId}`);
        
        // Send the user the current state of the server
        newUser.sendPacket(new ServerStatePacket(this.roomManager.cardRetriever.packetCache));
    }

    /**
     * This is called when a connection get disconnected
     * 
     * @param socket the disconnecting socket 
     */
    onDisconnect(socket: SocketIO.Socket) {
        let user = this.users.get(socket.id);
        if (user == undefined) return;

        console.debug(`User '${user.username}'(${user.userId}) disconnected. After 5 mins he gets removed.`);
    }
}