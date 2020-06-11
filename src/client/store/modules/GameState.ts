import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { UserStateUpdatePacket, RoomStatePacket, PartialRoomStatePacket, PartialUserStateUpdatePacket } from '../../../common/network/ServerPackets';
import Room from '../../../common/models/Room';
import Player from '../../../common/models/Player';
import { ResponseCard } from '../../../common/models/Card';
import Settings from '../../../common/models/Settings';
import Round from '../../../common/models/Round';

@Module
export default class GameState extends VuexModule {
    player: Player = null;
    room: Room = null;
    cards: ResponseCard[] = null;
    settings: Settings = null;
    round: Round = null;

    @Mutation
    SOCKET_stateUpdate(packet: UserStateUpdatePacket) {
        this.room = packet.state.room;
        this.round = packet.state.room?.round;
        this.player = packet.state.player;
        this.cards = packet.state.cards;
        if (packet.state.room != null && packet.state.room.settings != this.settings)
            this.settings = packet.state.room.settings;
    };

    @Mutation
    SOCKET_partialStateUpdate(packet: PartialUserStateUpdatePacket) {
        if (packet.state.player != null) this.player = packet.state.player;
        if (packet.state.room != null) {
            this.room = packet.state.room;
            this.round = packet.state.room.round;
            this.settings = packet.state.room.settings;
        }
        if (packet.state.cards != null) this.cards = packet.state.cards;
    }

    @Mutation
    SOCKET_roomState(packet: RoomStatePacket) {
        this.room = packet.room;
        this.settings = packet.room.settings;
        this.round = packet.room.round;
    }

    @Mutation
    SOCKET_partialRoomState(packet: PartialRoomStatePacket) {
        let part = packet.room;
        if (part.id != null) this.room.id = part.id;
        if (part.owner != null) this.room.owner = part.owner;
        if (part.players != null) this.room.players = part.players;
        if (part.round != null) {
            this.room.round = part.round;
        }
        if (part.settings != null) {
            if (part.settings != this.settings)
                this.settings = part.settings;
        }
    }
};