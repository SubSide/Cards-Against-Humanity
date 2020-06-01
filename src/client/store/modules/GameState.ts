import Vuex from 'vuex';
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { UserStateUpdatePacket, RoomJoinedPacket, RoomLeftPacket } from '../../../common/network/ServerPackets';
import { PlayerState } from '../../../common/models/Player';
import { Room } from '../../../common/models/Room';

@Module
export default class GameState extends VuexModule {
    playerState: PlayerState = null;
    roomState: Room = null;

    @Mutation
    SOCKET_stateUpdate(packet: UserStateUpdatePacket) {
        console.debug('Packet received in GameState:', packet);
        this.roomState = packet.room;
        this.playerState = packet.playerState;
    };

    @Mutation
    SOCKET_roomJoined(packet: RoomJoinedPacket) {
        this.roomState = packet.room;
    }
    
    @Mutation
    SOCKET_roomLeft(packet: RoomLeftPacket) {
        this.roomState = null;
    }
};