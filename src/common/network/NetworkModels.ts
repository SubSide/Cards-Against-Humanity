import Player from "../models/Player";
import { ResponseCard } from "../models/Card";
import Room from "../models/Room";
import User from "../models/User";
import Pack from "../models/Pack";
import Role from "../models/Role";

export interface ServerState {
    packs: Pack[]
}

export interface RoomListSettings {
    name: string;
    players: Player[];
    packIds: string[];
}

export interface RoomListItem {
    id: string;
    settings: RoomListSettings,
    playerCount: number;
}

export interface OwnState {
    user: User;
    role: Role,
    player?: Player;
    room?: Room;
    cards?: ResponseCard[];
}