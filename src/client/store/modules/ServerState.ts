import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { ServerStatePacket } from '../../../common/network/ServerPackets';
import Pack, { PackGroup } from '../../../common/models/Pack';

@Module
export default class GameState extends VuexModule {
    packGroups: PackGroup[] = null;
    packs: Map<string, Pack> = null;

    @Mutation
    SOCKET_serverState(packet: ServerStatePacket) {
        this.packGroups = packet.packGroups;
        let packs = new Map<string, Pack>();
        packet.packGroups.forEach(group => {
            group.packs.forEach(pack => {
                packs.set(pack.id, pack);
            });
        });

        this.packs = packs;
    };
};