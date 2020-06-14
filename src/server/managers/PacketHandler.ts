import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket, JoinRoomPacket, RequestStateUpdatePacket, ChangeNicknamePacket, LeaveRoomPacket, ChangeRoomSettingsPacket, StartGamePacket } from "../../common/network/ClientPackets";
import ServerUser from "../models/ServerUser";
import GameManager from "../GameManager";
import { RoomListPacket, ErrorPacket } from "../../common/network/ServerPackets";
import ClientError from "../util/ClientError";
import Role from "../../common/models/Role";
import { validatedSettings, areSettingsPleasant } from "../util/SettingsUtils";

export default class PacketHandler {
    
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
            case 'changeRoomSettings':
                this.handleChangeRoomSettings(user, packet);
                break;
            case 'startGame':
                this.handleStartGame(user, packet);
                break;
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

        let nicknameRegex = new RegExp('^[a-zA-Z0-9]{4,16}$');
        if (
            packet.newNickname == null ||
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
                user.tags = info.tags;
            }
            
            user.sendUpdateState();

            // Just because it is nice, we also send a new player list to all the players
            // in the room that the user is (possibly) in.
            let player = user.player;
            if (player != null) {
                player.room.sendAllPartialUpdate([user], 'players', 'owner')
            }
        })();
    }

    private handleChangeRoomSettings(user: ServerUser, packet: ChangeRoomSettingsPacket) {
        if (!user.canDo('changeRoomSettings', 1000)) {
            throw new ClientError("Settings should only be send every 2 seconds");
        }
        
        if (user.player == null || !user.player.canEditRoom()) {
            throw new ClientError("You don't have permissions to edit this room!");
        }

        let settings = validatedSettings(this.gameManager.roomManager.cardRetriever, packet.roomSettings);
        if (settings == null) {
            throw new ClientError("Settings were malformed");
        }

        // Here we do duplicate checking
        let currentSettings = user.player.room.settings;
        duplicateTesting: {
            if (settings.maxPlayers != currentSettings.maxPlayers) break duplicateTesting;
            if (settings.pointsToWin != currentSettings.pointsToWin) break duplicateTesting;
            if (settings.timeToRespond != currentSettings.timeToRespond) break duplicateTesting;
            
            // This is a b!tch to fix
            if (settings.packIds.length != currentSettings.packIds.length) {
                break duplicateTesting;
            }

            for (var packId of settings.packIds) {
                if (currentSettings.packIds.indexOf(packId) < 0) {
                    console.debug(packId +" not in", currentSettings.packIds);
                    break duplicateTesting;
                }
            }

            return; // No changes!!
        }
        // ---


        user.player.room.settings = settings;
        user.player.room.sendAllPartialUpdate([user], 'settings');
    }

    private handleStartGame(user: ServerUser, startGamePacket: StartGamePacket) {
        if (!user.canDo("startGame", 2000)) {
            throw new ClientError("Wait a moment before trying this action again!");
        }

        if (user.player == null || !user.player.canEditRoom()) {
            throw new ClientError("You don't have permissions to edit this room!");
        }

        let room = user.player.room;

        let settings = startGamePacket.settings;

        // Make sure we have pleasant settings
        areSettingsPleasant(this.gameManager.roomManager.cardRetriever, room, settings);


        // Set the settings
        room.settings = settings;

        // Start the game
        room.start();
    }
}