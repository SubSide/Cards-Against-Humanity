import { Player } from "../models/Player";
import { WhiteCard } from "../models/Card";
import { Room } from "../models/Room";
import { User } from "../models/User";

export interface RoomListSettings {
    name: string;
    maxPlayers: number;
    packIds: string[];
    hasCustomCards: boolean;
}

export interface RoomListItem {
    id: string;
    settings: RoomListSettings,
    playerCount: number;
}


export interface RoomState {
    room: Room;
    round?: Number;
}


export interface OwnState {
    user: User;
    player?: Player;
    room?: Room;
    cards?: WhiteCard[];
}