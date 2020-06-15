import { ClientPacketType, CreateRoomPacket, RequestRoomsPacket, JoinRoomPacket, RequestStateUpdatePacket, ChangeNicknamePacket, LeaveRoomPacket, ChangeRoomSettingsPacket, StartGamePacket, RequestUserManagementPacket, DoUserManagementPacket } from "../../common/network/ClientPackets";
import ServerUser from "../models/ServerUser";
import GameManager from "../GameManager";
import { RoomListPacket, ErrorPacket, UserManagementPacket, InfoPacket } from "../../common/network/ServerPackets";
import ClientError from "../util/ClientError";
import Role from "../../common/models/Role";
import { validatedSettings, areSettingsPleasant } from "../util/SettingsUtils";
import { TagType } from "../../common/models/Tag";
import Tag from "../../common/models/Tag";

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
            case 'requestUserManagement':
                this.handleUserManagement(user, packet);
                break;
            case 'doUserManagement':
                this.doUserManagement(user, packet);
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

            // Send global update so everyone is updated
            user.updateGlobal();
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

    private doUserManagement(user: ServerUser, packet: DoUserManagementPacket) {
        if (user.role < Role.Moderator) {
            throw new ClientError("You do not have the permissions to do this action!");
        }

        if (!user.canDo("doUserManagement", 200)) {
            throw new ClientError("Wait a moment between user management requests.");
        }
        

        let editUser: ServerUser = this.gameManager.getUserById(packet.userId);
        if (editUser == null) {
            throw new ClientError("This user doesn't exist!");
        }

        if (editUser.role >= user.role) {
            throw new ClientError("You can't edit someone with the same or higher rank as yours!");
        }

        if (packet.payload.type == 'manUserKickOutRoom') {
            if (editUser.player == null) {
                throw new ClientError("This user isn't in a room.");
            }

            // Let the player leave the room
            editUser.player.room.leave(editUser.player);
            user.sendPacket(new InfoPacket("User removed from room"));
        } else if(packet.payload.type == 'manUserDisconnect') {
            // Remove the user from the room
            editUser.player.room.leave(editUser.player);
            // Then remove him from the user list
            this.gameManager.users.delete(editUser.socket.id);
            user.sendPacket(new InfoPacket("User disconnected"));
        } else if (packet.payload.type == 'manUserBan') {
            // TODO
        } else if (packet.payload.type == 'manUserSetRole') {
            let role = packet.payload.role;
            if (!Number.isInteger(role) || role < Role.Default || role > Role.Administrator) {
                throw new ClientError("Invalid Role!");
            }

            if (role >= user.role) {
                throw new ClientError("You can't set the role higher or the same as yours");
            }

            // Set the role in database
            this.gameManager.userRetriever.setRole(editUser, role);
            // Set user role
            editUser.role = role;
            // Update user
            editUser.sendPartialUpdate('role');
            user.sendPacket(new InfoPacket("User role changed!"));
        } else if (packet.payload.type == 'manUserTags') {

            if (packet.payload.payload.type == 'add') {
                let tagType = packet.payload.payload.tagType;
                let text = packet.payload.payload.text;

                if (!(tagType in TagType)) {
                    throw new ClientError("Unknown tag type.");
                }

                // Text can only be an alphanumeric string
                if (!text.match(/^[a-zA-Z0-9]+$/) || text.length < 2 || text.length > 24) {
                    throw new ClientError("Invalid tag text.");
                }
                
                let tag: Tag = {
                    text: text,
                    type: tagType
                };

                // Add to database
                this.gameManager.userRetriever.addTag(editUser, tag);
                // Add to user
                editUser.tags.push(tag);
                // Update user globally
                editUser.updateGlobal();
            } else if(packet.payload.payload.type == 'remove') {
                let tagText = packet.payload.payload.text;

                // Remove from database
                this.gameManager.userRetriever.removeTag(editUser, tagText);
                // Remove from user
                editUser.tags.splice(editUser.tags.findIndex(tag => tag.text == tagText), 1);
                // Update user globally
                editUser.updateGlobal();
            } else {
                throw new ClientError("Unknown management type");
            }
        } else {
            throw new ClientError("Unknown user management type");
        }

        user.sendPacket(new UserManagementPacket(
            editUser.getTransmitData(),
            editUser.role,
            editUser.player?.getTransmitData()
        ));
    }
}