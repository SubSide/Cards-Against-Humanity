import VueSocketIO from 'vue-socket.io';
import Vue from 'vue';
import Vuex from 'vuex';
import App from './components/App.vue';

$.ready.then(() => {
    const store = new Vuex.Store({
        state: {
            user: {},
            currentRoom: {}
        },
        mutations: {
            SOCKET_stateUpdate(state, packet) {
                state.user = packet.user;
                state.currentRoom = packet.room;
            },
            SOCKET_roomJoined(state, packet) {
                state.currentRoom = packet.room;
            },
            SCOKET_roomLeft(state, packet) {
                state.currentRoom = null;
            }
        }
    });

    (Vue as any).use(new VueSocketIO({
        debug: true,
        vuex: {
            store,
            actionPrefix: 'SOCKET_',
            mutationPrefix: 'SOCKET_'
        },
        connection: 'localhost:3001'
    }));

    var app = new Vue({
        el: "#app",
        render: c => c(App)
    });
})