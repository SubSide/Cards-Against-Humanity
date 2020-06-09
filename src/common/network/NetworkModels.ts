import Player from "../models/Player";
import { ResponseCard } from "../models/Card";
import Room from "../models/Room";
import User from "../models/User";
import Pack from "../models/Pack";
import Role from "../models/Role";


export interface RoomListItem {
    name: string,
    id: string,
    maxPlayers: number,
    packIds: string[],
    players: Player[]
}

export interface OwnState {
    user: User;
    role: Role,
    player?: Player;
    room?: Room;
    cards?: ResponseCard[];
}