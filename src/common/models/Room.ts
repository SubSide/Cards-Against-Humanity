import { Settings, RoomListSettings } from "./Settings";
import { Player } from "./Player";
import { WhiteCard } from "./Card";

export interface Room {
    id: string;
    players: Player[];
    settings: Settings;
}

export interface RoomListItem {
    id: string;
    settings: RoomListSettings,
    playerCount: number;
}