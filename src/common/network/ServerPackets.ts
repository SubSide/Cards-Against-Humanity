import { Room } from "../models/Room";
import { Round } from "../models/Round";
import { User } from "../models/User";
import { RoomListItem, OwnState } from "./NetworkModels";

export type ServerPacketType =
    RoomListPacket |
    RoomJoinedPacket |
    RoomLeftPacket |
    UserStateUpdatePacket |
    RoomChangedPacket |
    ErrorPacket


export interface ServerPacket {
    type: string;
}

export class RoomListPacket implements RoomListPacket {
    type: 'roomList' = 'roomList';
    constructor(public roomList: RoomListItem[]) {}
}

export class RoomJoinedPacket implements ServerPacket {
    type: 'roomJoined' = 'roomJoined';
    constructor(public room: Room) {}
}

export class RoomLeftPacket implements ServerPacket {
    type: 'roomLeft' = 'roomLeft';
}

export class RoomChangedPacket implements ServerPacket {
    type: 'roomChanged' = 'roomChanged';
    constructor(public room: Room) {}
}

export class RoundUpdatePacket implements ServerPacket {
    type: 'roundUpdate' = 'roundUpdate';
    constructor(public round: Round) {}
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
