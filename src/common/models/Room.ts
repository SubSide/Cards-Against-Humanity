import Settings from "./Settings";
import Player from "./Player";
import Round from "./Round";
import User from "./User";

export default interface Room extends PartialRoom {
    id: string;
    settings: Settings;
    owner: User;
    round: Round;
    players: Player[];
}

export interface PartialRoom {
    id?: string,
    settings?: Settings,
    owner?: User,
    round?: Round,
    players?: Player[],
}