import { Card, BlackCard, WhiteCard } from '../../shared/models/Card';

export interface Pack {
    id?: string;
    name?: string;
    blackCards?: BlackCard[];
    whiteCards?: WhiteCard[];
}