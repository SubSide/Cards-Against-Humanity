import { Db, CommandCursor } from 'mongodb';
import PackGroup from '../models/PackGroup';
import Pack from '../models/Pack';
import TreeItem from '../../common/utils/TreeItem';

export default class CardRetriever {
    public groups: PackGroup[] = [];
    private packs: Map<String, Pack> = new Map();
    public packTree: TreeItem;

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
        this.packTree = this.createPackTree();
    }

    findPack(id: string): Pack {
        return this.packs.get(id);
    }

    private createPackTree(): TreeItem {
        return {
            id: "OwO",
            includeSelf: false,
            showSelf: false,
            text: "Group",
            children: this.groups.sort((a,b) => a.orderNumber - b.orderNumber).map(group => {
                return {
                    id: group.name,
                    text: group.name,
                    includeSelf: false,
                    children: group.packs.sort(this.sortTreeItem).map(pack => {
                        return {
                            id: pack.id,
                            text: pack.name
                        }
                    })
                }
            })
        }
    }

    private sortTreeItem(itemA: Pack, itemB: Pack): number {
        var textA = itemA.name.toUpperCase();
        var textB = itemB.name.toUpperCase();

        if (textA < textB) return -1;
        if (textA > textB) return 1;
        return 0;
    }
}