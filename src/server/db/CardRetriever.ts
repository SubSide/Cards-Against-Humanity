import { Db, CommandCursor } from 'mongodb';
import PackGroup from '../models/PackGroup';
import Pack from '../models/Pack';

export default class CardRetriever {
    public groups: PackGroup[] = [];
    private packs: Map<String, Pack> = new Map();

    constructor(db: Db) {
        this.retrieveCards(db);
    }

    async retrieveCards(db: Db) {
        let result = await db.collection('packGroups').find().toArray();
        this.groups = result as PackGroup[];
        this.packs = new Map();

        this.groups.forEach(packGroup => {
            packGroup.packs.forEach(pack => {
                this.packs.set(pack.id, pack);
            });
        });
    }

    findPack(id: string): Pack {
        return this.packs.get(id);
    }
}