import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket, JoinRoomPacket, RequestStateUpdatePacket } from "../../common/network/ClientPackets";
import { ServerUser } from "../models/ServerUser";
import { GameManager } from "../GameManager";
import { RoomListPacket } from "../../common/network/ServerPackets";
import ClientError from "../util/ClientError";

export class PacketHandler {
    
    constructor(public gameManager: GameManager) {
    }

    incomingPacket(user: ServerUser, packet: ClientPacketType) {
        switch (packet.type) {
            case 'createRoom':
                this.handleCreateRoom(user, packet);
                break;
            case 'requestRooms':
                this.handleRequestRooms(user, packet);
                break;
            case 'joinRoom':
                this.handleJoinRoom(user, packet);
                break;
            case 'requestStateUpdate':
                this.requestStateUpdate(user, packet);
                break;
        }
        
    }
    
    private handleJoinRoom(user: ServerUser, packet: JoinRoomPacket) {
        let room = this.gameManager.roomManager.getRoom(packet.roomId);
        
        if (room == null) {
            throw new ClientError('This room doesn\'t exist.');
        }

        room.join(user);
    }

    private handleCreateRoom(user: ServerUser, packet: CreateRoomPacket) {
        this.gameManager.roomManager.createRoom(user, packet.roomSettings);
    }

    private requestStateUpdate(user: ServerUser, packet: RequestStateUpdatePacket) {
        user.sendUpdateState();
    }

    private handleRequestRooms(user: ServerUser, packet: RequestRoomsPacket) {
        user.sendPacket(new RoomListPacket(
            this.gameManager.roomManager.rooms.map(map => map.getListTransmitData())
        ))
    }
}