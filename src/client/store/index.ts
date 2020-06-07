import Vuex from 'vuex';
import { UserStateUpdatePacket } from '../../common/network/ServerPackets';
import GameState from './modules/GameState';
import SettingsState from './modules/SettingsState';
import User from '../../common/models/User';
import Role from '../../common/models/Role';

export default new Vuex.Store({
    state: {
        user: {},
        role: Role.Default
    },
    mutations: {
        SOCKET_stateUpdate(state, packet: UserStateUpdatePacket) {
            state.user = packet.state.user;
            state.role = packet.state.role;
        },
    },
    getters: {
        user: function(state): User {
            return state.user as User;
        },
        role: function(state): Role {
            return state.role as Role;
        }
    },
    modules: {
        game: GameState,
        settings: SettingsState
    }
});