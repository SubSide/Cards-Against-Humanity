import { User } from "./User";

export interface Player {
    user: User;
    points: number;
    hasPlayedCard: boolean;
}