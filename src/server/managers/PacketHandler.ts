import { PacketType, CreateRoomPacket} from "../../shared/network/Packets";

export class PacketHandler {
    incomingPacket(packet: PacketType) {
        try {
            switch (packet.type) {
                case 'createRoom':
                    this.handleCreateRoom(packet);
                    break;
            }
        } catch (e) {
            console.warn('Malformed packet received: ')
        }
        
    }

    handleCreateRoom(packet: CreateRoomPacket) {

    }
}