import VueSocketIO from 'vue-socket.io';
import Vue from 'vue';
import Vuex from 'vuex';
import App from './components/App.vue';

$.ready.then(() => {
    const store = new Vuex.Store({
        state: {
            appState: '',
            user: {},
        }
    });

    Vue.use(new VueSocketIO({
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