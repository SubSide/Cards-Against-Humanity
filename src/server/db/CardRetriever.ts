import { Db, CommandCursor } from 'mongodb';
import { PackGroup } from '../models/PackGroup';

export class CardRetriever {
    public groups: PackGroup[] = [];

    constructor(db: Db) {
        this.retrieveCards(db);
    }

    async retrieveCards(db: Db) {
        let result = await db.collection('packGroups').find().toArray();
        this.groups = result as PackGroup[];
    }
}