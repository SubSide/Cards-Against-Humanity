import Vuex from 'vuex';
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { UserStateUpdatePacket, RoomJoinedPacket, RoomLeftPacket } from '../../../common/network/ServerPackets';
import { Room } from '../../../common/models/Room';
import { OwnState } from '../../../common/network/NetworkModels';
import { Player } from '../../../common/models/Player';
import { WhiteCard } from '../../../common/models/Card';

@Module
export default class GameState extends VuexModule {
    player: Player = null;
    room: Room = null;
    cards: WhiteCard[] = null;

    @Mutation
    SOCKET_stateUpdate(packet: UserStateUpdatePacket) {
        this.room = packet.state.room;
        this.player = packet.state.player;
        this.cards = packet.state.cards;
    };

    @Mutation
    SOCKET_roomJoined(packet: RoomJoinedPacket) {
        this.room = packet.room;
    }
    
    @Mutation
    SOCKET_roomLeft(packet: RoomLeftPacket) {
        this.room = null;
    }
};