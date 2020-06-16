import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket, JoinRoomPacket, RequestStateUpdatePacket, ChangeNicknamePacket, LeaveRoomPacket, ChangeRoomSettingsPacket, StartGamePacket, RequestUserManagementPacket, DoUserManagementPacket, PlayCardPacket } from "../../common/network/ClientPackets";
import ServerUser from "../models/ServerUser";
import GameManager from "../GameManager";
import { RoomListPacket, ErrorPacket, UserManagementPacket, InfoPacket } from "../../common/network/ServerPackets";
import ClientError from "../util/ClientError";
import Role from "../../common/models/Role";
import { validatedSettings, areSettingsPleasant } from "../util/SettingsUtils";
import UserManagementHandler from "./UserManagementHandler";
import { ResponseCard } from "../../common/models/Card";

export default class PacketHandler {
    private userManagement: UserManagementHandler;
    constructor(public gameManager: GameManager) {
        this.userManagement = new UserManagementHandler(gameManager);
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
            case 'changeRoomSettings':
                this.handleChangeRoomSettings(user, packet);
                break;
            case 'startGame':
                this.handleStartGame(user, packet);
                break;
            case 'playCard':
                this.handlePlayCard(user, packet);
                break;
            case 'requestUserManagement':
                this.handleUserManagement(user, packet);
                break;
            case 'doUserManagement':
                this.userManagement.handlePacket(user, packet);
        }
        
    }
    
    private handleJoinRoom(user: ServerUser, packet: JoinRoomPacket) {
        let room = this.gameManager.roomManager.getRoom(packet.roomId);
        if (!user.canDo("joinRoom", 1000)) {
            throw new ClientError("Wait a moment before joining another room.");
        }
        
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
        if (!user.canDo("createRoom", 1000)) {
            throw new ClientError("Wait a moment before create a room again.");
        }
        this.gameManager.roomManager.createRoom(user);
    }

    private requestStateUpdate(user: ServerUser, packet: RequestStateUpdatePacket) {
        user.sendUpdateState();
    }

    private handleRequestRooms(user: ServerUser, packet: RequestRoomsPacket) {
        if (!user.canDo("nicknameChange", 1000)) {
            throw new ClientError("Wait a moment before requesting rooms again.");
        }
        user.sendPacket(new RoomListPacket(
            this.gameManager.roomManager.rooms.map(map => map.getListTransmitData())
        ))
    }

    private handleNicknameChange(user: ServerUser, packet: ChangeNicknamePacket) {
        if (!user.canDo("nicknameChange", 5000)) {
            throw new ClientError("Wait a moment before changing your nickname again.");
        }

        // Update username
        user.updateUsername(this.gameManager.userRetriever, packet.newNickname, packet.hash);
    }

    private handleChangeRoomSettings(user: ServerUser, packet: ChangeRoomSettingsPacket) {
        if (!user.canDo('changeRoomSettings', 1000)) {
            throw new ClientError("Settings should only be send every 2 seconds");
        }
        
        if (user.player == null || !user.player.canEditRoom()) {
            throw new ClientError("You don't have permissions to edit this room!");
        }

        // We do setting validation here
        let settings = validatedSettings(this.gameManager.roomManager.cardRetriever, packet.roomSettings);
        if (settings == null) {
            throw new ClientError("Settings were malformed");
        }
        
        // Update settings
        user.player.room.updateSettings(user, settings);
    }

    private handleStartGame(user: ServerUser, startGamePacket: StartGamePacket) {
        if (!user.canDo("startGame", 2000)) {
            throw new ClientError("Wait a moment before trying this action again!");
        }

        if (user.player == null || !user.player.canEditRoom()) {
            throw new ClientError("You don't have permissions to edit this room!");
        }

        let room = user.player.room;
        // Update settings, we do this so if we change the settings and immediately press start
        // We get the latest settings for sure
        // We call updateSettings so we know for sure 
        room.updateSettings(user, startGamePacket.settings);
        room.start(this.gameManager.roomManager.cardRetriever);
    }

    private handlePlayCard(user: ServerUser, packet: PlayCardPacket) {
        if (user.player == null) {
            throw new ClientError("Malformed packet");
        }

        user.player.room.userPlaysCards(user.player, packet.cardIds);
    }
    
    private handleUserManagement(user: ServerUser, packet: RequestUserManagementPacket) {
        if (user.role < Role.Moderator) {
            throw new ClientError("You do not have the permissions to do this action!");
        }

        if (!user.canDo("userManagement", 2000)) {
            throw new ClientError("Wait a moment between user management requests.");
        }

        let editUser: ServerUser = this.gameManager.getUserById(packet.userId);
        if (editUser == null) {
            throw new ClientError("This user doesn't exist!");
        }

        user.sendPacket(new UserManagementPacket(
            editUser.getTransmitData(),
            editUser.role,
            editUser.player?.getTransmitData()
        ));
    }
}