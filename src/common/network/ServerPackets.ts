import Room, { PartialRoom } from "../models/Room";
import { RoomListItem, OwnState } from "./NetworkModels";
import { PackGroup } from "../models/Pack";

export type ServerPacketType =
    RoomListPacket |
    UserStateUpdatePacket |
    ServerStatePacket |
    ErrorPacket


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

export class ChatPacket implements ServerPacket {
    type: 'chatEvent' = 'chatEvent';
    constructor() {} // TODO
}

export class ErrorPacket implements ServerPacket {
    type: 'errorPacket' = 'errorPacket';
    constructor(public error: string) {}
}

export class ServerStatePacket implements ServerPacket {
    type: 'serverState' = 'serverState';
    constructor(public packGroups: PackGroup[]) {}
}
