import { Player } from "./Player";
import { PromptCard } from "./Card";

export interface  Round {
    czar: Player;
    promptCard: PromptCard;
    roundNumber: number;
}