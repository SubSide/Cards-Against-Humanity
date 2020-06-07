import Player from "./Player";
import { PromptCard } from "./Card";

export default interface Round {
    czar: Player;
    promptCard: PromptCard;
    roundNumber: number;
}