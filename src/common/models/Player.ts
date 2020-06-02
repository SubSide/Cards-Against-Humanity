import { User } from "./User";
import { WhiteCard } from "./Card";

export interface Player {
    user: User;
    points: number;
    hasPlayedCard: boolean;
}