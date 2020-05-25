import { Settings } from "./Settings";
import { Player } from "./Player";

export interface Room {
    id: string;
    players: Player[];
    settings: Settings;
}