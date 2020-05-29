import { Settings } from "./Settings";
import { Player } from "./Player";

export interface Room {
    id: string;
    name: string;
    players: Player[];
    settings: Settings;
}

export interface RoomListItem {
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
}