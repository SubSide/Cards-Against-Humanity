import Room, { PartialRoom } from "../models/Room";
import { RoomListItem, OwnState, PartialOwnState } from "./NetworkModels";
import { PackGroup } from "../models/Pack";
import User from "../models/User";
import Role from "../models/Role";
import Player from "../models/Player";

export type ServerPacketType =
    RoomListPacket |
    UserStateUpdatePacket |
    ServerStatePacket |
    InfoPacket |
    ErrorPacket |
    UserManagementPacket


export interface ServerPacket {
    type: string;
}

export class RoomListPacket implements RoomListPacket {
    type: 'roomList' = 'roomList';
    constructor(public roomList: RoomListItem[]) {}
}

export class RoomStatePacket implements ServerPacket {
    type: 'roomState' = 'roomState';
    constructor(public room: Room) {}
}

export class PartialRoomStatePacket implements ServerPacket {
    type: 'partialRoomState' = 'partialRoomState';
    constructor(public room: PartialRoom) {}
}

export class UserStateUpdatePacket implements ServerPacket {
    type: 'stateUpdate' = 'stateUpdate';
    constructor(public state: OwnState) {}
}

export class PartialUserStateUpdatePacket implements ServerPacket {
    type: 'partialStateUpdate' = 'partialStateUpdate';
    constructor(public state: PartialOwnState) {}
}

export class ChatPacket implements ServerPacket {
    type: 'chatEvent' = 'chatEvent';
    constructor() {} // TODO
}

export class ErrorPacket implements ServerPacket {
    type: 'errorPacket' = 'errorPacket';
    constructor(public error: string) {}
}

export class InfoPacket implements ServerPacket {
    type: 'infoPacket' = 'infoPacket';
    constructor(public info: string) {}
}

export class ServerStatePacket implements ServerPacket {
    type: 'serverState' = 'serverState';
    constructor(public packGroups: PackGroup[]) {}
}


export class UserManagementPacket implements ServerPacket {
    type: 'userManagement' = 'userManagement';
    constructor(
        public user: User,
        public role: Role,
        public player?: Player,
        public roomId?: string,
    ) {}
}
