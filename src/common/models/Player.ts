import User from "./User";

export default interface Player {
    user: User;
    points: number;
    hasPlayedCards: boolean;
}