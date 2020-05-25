import { Player } from "./Player";
import { BlackCard } from "./Card";

export interface  Round {
    czar: Player;
    blackCard: BlackCard;
    roundNumber: number;
}