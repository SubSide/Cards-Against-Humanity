import { Settings } from "../models/Settings";

export type ClientPacketType =
    SocketChangePacket |
    RequestRoomsPacket |
    CreateRoomPacket |
    JoinRoomPacket |
    LeaveRoomPacket |
    SendChatPacket |
    ChangeNicknamePacket


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
    constructor(public roomSettings: Settings) {}
}

export class JoinRoomPacket implements ClientPacket {
    type: 'joinRoom' = 'joinRoom';
    constructor(public roomId: string, public password: string = null) {}
}

export class LeaveRoomPacket implements ClientPacket {
    type: 'leaveRoom' = 'leaveRoom';
    constructor() {}
}

export class SendChatPacket implements ClientPacket {
    type: 'sendChat' = 'sendChat';
    constructor() {} // TODO
}

export class ChangeNicknamePacket implements ClientPacket {
    type: 'changeNickname' = 'changeNickname';
    constructor(public newNickname: string) {}
}