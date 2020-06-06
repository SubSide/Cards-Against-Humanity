import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket, JoinRoomPacket, RequestStateUpdatePacket, ChangeNicknamePacket, LeaveRoomPacket } from "../../common/network/ClientPackets";
import { ServerUser } from "../models/ServerUser";
import { GameManager } from "../GameManager";
import { RoomListPacket } from "../../common/network/ServerPackets";
import ClientError from "../util/ClientError";
import { Server } from "mongodb";
import Role from "../../common/models/Role";

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
            case 'leaveRoom':
                this.handleLeaveRoom(user, packet);
                break;
            case 'requestStateUpdate':
                this.requestStateUpdate(user, packet);
                break;
            case 'changeNickname':
                this.handleNicknameChange(user, packet);
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

    private handleLeaveRoom(user: ServerUser, packet: LeaveRoomPacket) {
        let room = user.player?.room;
        if (room == null) {
            throw new ClientError("You are not currently in a room.");
        }

        room.leave(user.player);
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

    private handleNicknameChange(user: ServerUser, packet: ChangeNicknamePacket) {
        if (!user.canDo("nicknameChange", 5000)) {
            throw new ClientError("Wait a moment before changing your nickname again.");
        }

        let nicknameRegex = new RegExp('^[a-zA-Z0-9]{4,24}$');
        if (
            packet.newNickname == null || 
            packet.newNickname.length < 6 ||
            !nicknameRegex.test(packet.newNickname) ||
            (packet.hash != null && packet.hash.length > 100)
        ) {
            throw new ClientError("Nickname and/or hash are malformed");
        }

        (async () => {
            user.username = packet.newNickname;
            user.hash = null;
            user.role = Role.Default;
    
            if (packet.hash != null && packet.hash != "") {
                let info = await this.gameManager.userRetriever.getHashInfo(packet.newNickname, packet.hash);
                user.hash = info.hash;
                user.role = info.role;
            }
            
            user.sendUpdateState();
        })();
    }
}