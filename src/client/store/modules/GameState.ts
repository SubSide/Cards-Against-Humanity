import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { UserStateUpdatePacket, RoomStatePacket, PartialRoomStatePacket, PartialUserStateUpdatePacket } from '../../../common/network/ServerPackets';
import Room from '../../../common/models/Room';
import Player from '../../../common/models/Player';
import { ResponseCard } from '../../../common/models/Card';


@Module
export default class GameState extends VuexModule {
    player: Player = null;
    room: Room = null;
    cards: ResponseCard[] = null;
    playedCards: string[] = null;

    @Mutation
    SOCKET_stateUpdate(packet: UserStateUpdatePacket) {
        this.room = packet.state.room;
        this.player = packet.state.player;
        this.cards = packet.state.cards;
        this.playedCards = packet.state.playedCards;
    };

    @Mutation
    SOCKET_partialStateUpdate(packet: PartialUserStateUpdatePacket) {
        if (packet.state.player != null) this.player = packet.state.player;
        if (packet.state.room != null) this.room = packet.state.room;
        if (packet.state.cards != null) this.cards = packet.state.cards;
        if (packet.state.playedCards != null) this.playedCards = packet.state.playedCards;
    }

    @Mutation
    SOCKET_roomState(packet: RoomStatePacket) {
        this.room = packet.room;
    }

    @Mutation
    SOCKET_partialRoomState(packet: PartialRoomStatePacket) {
        this.room = { ...this.room, ...packet.room };
    }
};