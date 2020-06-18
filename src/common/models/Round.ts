import { PromptCard, ResponseCard } from "./Card";
import User from "./User";

export default interface Round {
    czar: User;
    promptCard: PromptCard;
    roundNumber: number;
    cardsChosen: ResponseCard[][];
    winnerCards: string[];
    winner: User;
}