import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket } from "../../shared/network/ClientPackets";
import { ServerUser } from "../models/ServerUser";
import { GameManager } from "../GameManager";
import { RoomListPacket } from "../../shared/network/ServerPackets";

export class PacketHandler {
    
    constructor(
        public gameManager: GameManager,
        private serverIO: SocketIO.Server
    ) {
    }

    incomingPacket(user: ServerUser, packet: ClientPacketType) {
        switch (packet.type) {
            case 'createRoom':
                this.handleCreateRoom(user, packet);
                break;
            case 'requestRooms':
                this.handleRequestRooms(user, packet);
                break;
        }
        
    }

    private handleCreateRoom(user: ServerUser, packet: CreateRoomPacket) {
        this.gameManager.roomManager.createRoom(user, packet.roomSettings);
    }

    private handleRequestRooms(user: ServerUser, packet: RequestRoomsPacket) {
        user.sendPacket(this.serverIO, new RoomListPacket(
            this.gameManager.roomManager.rooms.map(map => map.getListTransmitData())
        ))
    }
}