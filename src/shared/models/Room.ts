import { Settings } from "./Settings";
import { Player } from "./Player";

export interface Room {
    id: string;
    players: Player[];
    settings: Settings;
}

export interface RoomListItem {
    id: string;
    playerCount: number;
    maxPlayers: number;
}