import ServerUser from "../models/ServerUser";
import { DoUserManagementPacket } from "../../common/network/ClientPackets";
import GameManager from "../GameManager";
import ClientError from "../util/ClientError";
import Role from "../../common/models/Role";
import { InfoPacket, UserManagementPacket } from "../../common/network/ServerPackets";
import Tag, { TagType } from "../../common/models/Tag";
import { UserTagManagement } from "../../common/network/UserManagement";

export default class UserManagementHandler {
    
    constructor(private gameManager: GameManager) {

    }

    public handlePacket(user: ServerUser, packet: DoUserManagementPacket) {

        if (!user.canDo("doUserManagement", 200)) {
            throw new ClientError("Wait a moment between user management requests.");
        }

        let editUser: ServerUser = this.gameManager.getUserById(packet.userId);
        if (editUser == null) {
            throw new ClientError("This user doesn't exist!");
        }

        this.doUserManagement(user, editUser, packet);
    }

    private doUserManagement(master: ServerUser, minion: ServerUser, packet: DoUserManagementPacket) {

        // Only kick is allowed by the room owner
        if (
            master != minion && // Let's not kick ourselves
            packet.payload.type == 'manUserKickOutRoom' && // Is the correct packet
            master.player != null && minion.player != null && // Are both master and minion in a room
            master.player.room.owner == master && // Is the master the owner of the room
            master.player.room == minion.player.room // Are both master and minion in the same room
        ) {
            this.kickUser(master, minion);
            return;
        }

        if (master.role < Role.Moderator) {
            throw new ClientError("You do not have the permissions to do this action!");
        }

        if (minion.role >= master.role) {
            throw new ClientError("You can't edit someone with the same or higher rank as yours!");
        }

        if (packet.payload.type == 'manUserKickOutRoom') {
            this.kickUser(master, minion);
        } else if(packet.payload.type == 'manUserDisconnect') {
            this.disconnectUser(master, minion);
        } else if (packet.payload.type == 'manUserBan') {
            // TODO
        } else if (packet.payload.type == 'manUserSetRole') {
            this.setRole(master, minion, packet.payload.role);
        } else if (packet.payload.type == 'manUserTags') {
            this.manageUserTag(master, minion, packet.payload.payload);
        } else {
            throw new ClientError("Unknown user management type");
        }

        master.sendPacket(new UserManagementPacket(
            minion.getTransmitData(),
            minion.role,
            minion.player?.getTransmitData()
        ));
    }

    private kickUser(master: ServerUser, minion: ServerUser) {

            if (minion.player == null) {
                throw new ClientError("This user isn't in a room.");
            }

            // Let the player leave the room
            minion.leaveRoom();
            minion.sendPacket(new InfoPacket("You have been kicked from this room."));
            master.sendPacket(new InfoPacket("User removed from room"));
    }

    private disconnectUser(master: ServerUser, minion: ServerUser) {
            // Remove the user from the room
            minion.player.room.leave(minion.player);
            // Then remove him from the user list
            this.gameManager.users.delete(minion.socket.id);
            master.sendPacket(new InfoPacket("User disconnected"));
    }

    private setRole(master: ServerUser, minion: ServerUser, role: Role) {
        if (!Number.isInteger(role) || role < Role.Default || role > Role.Administrator) {
            throw new ClientError("Invalid Role!");
        }

        if (role >= master.role) {
            throw new ClientError("You can't set the role higher or the same as yours");
        }

        // Set the role in database
        this.gameManager.userRetriever.setRole(minion, role);
        // Set user role
        minion.role = role;
        // Update user
        minion.sendPartialUpdate('role');
        master.sendPacket(new InfoPacket("User role changed!"));
    }

    private manageUserTag(master: ServerUser, minion: ServerUser, tagManagement: UserTagManagement) {
        if (tagManagement.type == 'add') {
            let tagType = tagManagement.tagType;
            let text = tagManagement.text;

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
            this.gameManager.userRetriever.addTag(minion, tag);
            // Add to user
            minion.tags.push(tag);
            // Update user globally
            minion.updateGlobal();
        } else if(tagManagement.type == 'remove') {
            let tagText = tagManagement.text;

            // Remove from database
            this.gameManager.userRetriever.removeTag(minion, tagText);
            // Remove from user
            minion.tags.splice(minion.tags.findIndex(tag => tag.text == tagText), 1);
            // Update user globally
            minion.updateGlobal();
        } else {
            throw new ClientError("Unknown management type");
        }
    }
}