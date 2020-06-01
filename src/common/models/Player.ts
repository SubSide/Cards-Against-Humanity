import { User } from "./User";
import { WhiteCard } from "./Card";

export interface Player {
    user: User;
    points: number;
}

export interface PlayerState {
    player: Player;
    cards: WhiteCard[];
}