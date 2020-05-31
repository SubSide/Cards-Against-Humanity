import { Card, BlackCard, WhiteCard } from '../../common/models/Card';

export interface Pack {
    id?: string;
    name?: string;
    blackCards?: BlackCard[];
    whiteCards?: WhiteCard[];
}