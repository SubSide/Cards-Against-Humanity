import { Room, RoomListItem } from "../models/Room";
import { Round } from "../models/Round";

export type ServerPacketType =
    RoomListPacket |
    RoomJoinedPacket |
    RoomLeftPacket |
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
    constructor(round: Round) {}
}

export class ErrorPacket implements ServerPacket {
    type: 'error' = 'error';
    constructor(public error: string) {}
}