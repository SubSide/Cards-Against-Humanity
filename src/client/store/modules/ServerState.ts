import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { ServerStatePacket } from '../../../common/network/ServerPackets';
import TreeItem from '../../../common/utils/TreeItem';

@Module
export default class GameState extends VuexModule {
    packs: TreeItem = null;

    @Mutation
    SOCKET_serverState(packet: ServerStatePacket) {
        this.packs = packet.packs;
    };
};