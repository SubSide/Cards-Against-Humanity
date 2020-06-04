import { Db, CommandCursor } from 'mongodb';
import { PackGroup } from '../models/PackGroup';

export class CardManager {
    public groups: PackGroup[] = [];

    constructor(db: Db) {
        this.retrieveCards(db);
    }

    async retrieveCards(db: Db) {
        let result = await db.collection('packs').find().toArray();
        this.groups = result as PackGroup[];
    }
}