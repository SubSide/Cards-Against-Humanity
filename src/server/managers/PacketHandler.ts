import { ClientPacketType, CreateRoomPacket } from "../../shared/network/ClientPackets";
import { ServerUser } from "../models/ServerUser";
import { GameManager } from "../GameManager";

export class PacketHandler {
    
    constructor(
        public gameManager: GameManager
    ) {
    }

    incomingPacket(user: ServerUser, packet: ClientPacketType) {
        switch (packet.type) {
            case 'createRoom':
                this.handleCreateRoom(user, packet);
                break;
        }
        
    }

    private handleCreateRoom(user: ServerUser, packet: CreateRoomPacket) {
        this.gameManager.roomManager.createRoom(user, packet.roomSettings);
    }
}