import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { UserStateUpdatePacket } from '../../../common/network/ServerPackets';
import Room from '../../../common/models/Room';
import Player from '../../../common/models/Player';
import { ResponseCard } from '../../../common/models/Card';
import Role from '../../../common/models/Role';

@Module
export default class GameState extends VuexModule {
    player: Player = null;
    room: Room = null;
    cards: ResponseCard[] = null;

    @Mutation
    SOCKET_stateUpdate(packet: UserStateUpdatePacket) {
        this.room = packet.state.room;
        this.player = packet.state.player;
        this.cards = packet.state.cards;
    };
};