import VueSocketIO from 'vue-socket.io';
import Vue from 'vue';
import Store from './store/index';
import App from './components/App.vue';

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$.ready.then(() => {
    const store = Store;
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
        store: store,
        render: c => c(App)
    });
})