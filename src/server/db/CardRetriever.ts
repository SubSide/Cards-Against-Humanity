import { Db, CommandCursor } from 'mongodb';
import Pack, { ServerPackGroup } from '../models/ServerPack';
import { PackGroup } from '../../common/models/Pack';

export default class CardRetriever {
    public groups: ServerPackGroup[] = [];
    private packs: Map<String, Pack> = new Map();
    public packetCache: PackGroup[];

    constructor(db: Db) {
        this.retrieveCards(db);
    }

    async retrieveCards(db: Db) {
        let result = await db.collection('packGroups').find().toArray();
        this.groups = result as ServerPackGroup[];
        this.packs = new Map();

        this.groups.forEach(packGroup => {
            packGroup.packs.forEach(pack => {
                this.packs.set(pack.id, pack);
            });
        });
        this.packetCache = this.createPacketCache();
    }

    findPack(id: string): Pack {
        return this.packs.get(id);
    }

    private createPacketCache(): PackGroup[] {
        return this.groups.map(group => {
            return {
                title: group.name,
                packs: group.packs.map(pack => {
                    return {
                        id: pack.id,
                        name: pack.name
                    }
                })
            }
        })
    }

    private sortTreeItem(itemA: Pack, itemB: Pack): number {
        var textA = itemA.name.toUpperCase();
        var textB = itemB.name.toUpperCase();

        if (textA < textB) return -1;
        if (textA > textB) return 1;
        return 0;
    }
}