import Vuex from 'vuex';
import { UserStateUpdatePacket, RoomJoinedPacket, RoomLeftPacket } from '../../common/network/ServerPackets';
import GameState from './modules/GameState';
import { User } from '../../common/models/User';

export default new Vuex.Store({
    state: {
        user: {},
    },
    mutations: {
        SOCKET_stateUpdate(state, packet: UserStateUpdatePacket) {
            console.debug('packet received in store index:', packet);
            state.user = packet.user;
        },
    },
    getters: {
        user: function(state): User {
            return state.user as User;
        }
    },
    modules: {
        game: GameState
    }
});