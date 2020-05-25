import { Room } from "../models/Room";

export type ServerPacketType =
    RoomJoinedPacket |
    ErrorPacket


export interface ServerPacket {
    type: string;
}

export class RoomJoinedPacket implements ServerPacket {
    type: 'roomJoined';
    constructor(public room: Room) {}
}

export class RoomLeftPacket implements ServerPacket {
    type: 'roomLeft';
}

export class RoomChangedPacket implements ServerPacket {
    type: 'roomChanged';
    constructor(public room: Room) {}
}

export class ErrorPacket implements ServerPacket {
    type: 'error';
    constructor(public error: string) {}
}