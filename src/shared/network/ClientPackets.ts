import { Settings } from "../models/Settings";

export type ClientPacketType =
    SocketChangePacket |
    CreateRoomPacket |
    JoinRoomPacket |
    LeaveRoomPacket |
    ChangeNicknamePacket


export interface ClientPacket {
    type: string;
}

export class SocketChangePacket implements ClientPacket {
    type: 'socketChange';
    constructor(public oldId: string) {}
}

export class CreateRoomPacket implements ClientPacket {
    type: 'createRoom';
    constructor(public roomSettings: Settings) {}
}

export class JoinRoomPacket implements ClientPacket {
    type: 'joinRoom';
    constructor(public roomId: string, public password: string = null) {}
}

export class LeaveRoomPacket implements ClientPacket {
    type: 'leaveRoom';
}

export class ChangeNicknamePacket implements ClientPacket {
    type: 'changeNickname';
    constructor(public newNickname: string) {}
}