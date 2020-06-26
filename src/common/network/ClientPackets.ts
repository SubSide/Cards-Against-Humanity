import Settings from "../models/Settings";
import { UserManagement } from "./UserManagement";

export type ClientPacketType =
    SocketChangePacket |
    RequestRoomsPacket |
    CreateRoomPacket |
    JoinRoomPacket |
    RequestStateUpdatePacket |
    LeaveRoomPacket |
    ChangeRoomSettingsPacket |
    ChangeNicknamePacket |
    StartGamePacket |
    PlayCardPacket |
    RefreshInviteLinkPacket |
    JoinWithInvitePacket |
    RequestUserManagementPacket |
    DoUserManagementPacket


export interface ClientPacket {
    type: string;
}

export class SocketChangePacket implements ClientPacket {
    type: 'socketChange' = 'socketChange';
    constructor(public oldId: string) {}
}

export class RequestRoomsPacket implements ClientPacket {
    type: 'requestRooms' = 'requestRooms';
    constructor() {}
}

export class CreateRoomPacket implements ClientPacket {
    type: 'createRoom' = 'createRoom';
    constructor() {}
}

export class JoinRoomPacket implements ClientPacket {
    type: 'joinRoom' = 'joinRoom';
    constructor(public roomId: string, public password: string) {}
}

export class RequestStateUpdatePacket implements ClientPacket {
    type: 'requestStateUpdate' = 'requestStateUpdate';
    constructor() {}
}

export class LeaveRoomPacket implements ClientPacket {
    type: 'leaveRoom' = 'leaveRoom';
    constructor() {}
}

export class ChangeRoomSettingsPacket implements ClientPacket {
    type: 'changeRoomSettings' = 'changeRoomSettings';
    constructor(public roomSettings: Settings, public password: string) {}
}

export class RefreshInviteLinkPacket implements ClientPacket {
    type: 'refreshInviteLink' = 'refreshInviteLink';
    constructor(public remove: boolean) {}
}

export class JoinWithInvitePacket implements ClientPacket {
    type: 'joinWithInvite' = 'joinWithInvite';
    constructor(public inviteId: string) {}
}

export class StartGamePacket implements ClientPacket {
    type: 'startGame' = 'startGame';
    constructor(public settings: Settings) {}
}

export class PlayCardPacket implements ClientPacket {
    type: 'playCard' = 'playCard';
    constructor(public cardIds: string[]) {}
}

export class ChangeNicknamePacket implements ClientPacket {
    type: 'changeNickname' = 'changeNickname';
    constructor(public newNickname: string, public hash: string) {}
}

export class RequestUserManagementPacket implements ClientPacket {
    type: 'requestUserManagement' = 'requestUserManagement';
    constructor(public userId: string) {}
}

export class DoUserManagementPacket implements ClientPacket {
    type: 'doUserManagement' = 'doUserManagement';
    constructor(
        public userId: string,
        public payload: UserManagement
    ) {}
}