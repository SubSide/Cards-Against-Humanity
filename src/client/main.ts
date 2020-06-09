import VueSocketIO from 'vue-socket.io';
import Vue from 'vue';
import Store from './store/index';
import App from './components/App.vue';
import Username from './components/utils/Username.vue';
import Prompt from './components/utils/Prompt.vue';

$.ready.then(() => {
    Vue.component('username', Username);
    Vue.component('prompt', Prompt);

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