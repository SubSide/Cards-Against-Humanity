import { Db, CommandCursor } from 'mongodb';
import { BlackCard, WhiteCard } from '../../shared/models/Card';
import { Pack } from '../models/Pack';

export class CardManager {
    public packs: Pack[] = [];

    constructor(db: Db) {
        this.retrieveCards(db);
    }

    async retrieveCards(db: Db) {
        let result = await db.collection('packs').find().toArray();
        this.packs = result as Pack[];
    }
}