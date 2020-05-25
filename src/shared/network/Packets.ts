import { Room } from "../models/Room";

export type PacketType =
    SocketChangePacket |
    CreateRoomPacket |
    JoinRoomPacket |
    LeaveRoomPacket |
    ChangeNicknamePacket


export interface Packet<T> {
    type: string;
    data: T;
    error?: string;
}

export class SocketChangePacket implements Packet<string> {
    type: 'socketChange';

    constructor(
        public data: string,
        public error: string = null 
    ) {
        
    }
}

export class CreateRoomPacket implements Packet<Room> {
    type: 'createRoom';
    
    constructor(
        public data: Room,
        public error: string = null 
    ) {
        
    }
}

export class JoinRoomPacket implements Packet<string> {
    type: 'joinRoom';
    
    constructor(
        public data: string,
        public error: string = null 
    ) {
        
    }
}

export class LeaveRoomPacket implements Packet<void> {
    type: 'leaveRoom';
    
    constructor(
        public data: void = null,
        public error: string = null 
    ) {
        
    }
}

export class ChangeNicknamePacket implements Packet<string> {
    type: "changeNickname";
    
    constructor(
        public data: string,
        public error: string = null 
    ) {
        
    }
}