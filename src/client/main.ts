import VueSocketIO from 'vue-socket.io';
import Vue from 'vue';
import Store from './store/index';
import App from './components/App.vue';
import Username from './components/utils/Username.vue';
import Prompt from './components/utils/Prompt.vue';

// Here we do some stuff if we're in debug mode
if (process.env.DEBUG == 'true') {
    // We load the livereload script
    let script = document.createElement('script');
    script.setAttribute('src', 'http://localhost:35729/livereload.js"></script>');
    document.head.appendChild(script);
}

$.ready.then(() => {
    Vue.component('username', Username);
    Vue.component('prompt', Prompt);

    const store = Store;
    Vue.use(new VueSocketIO({
        debug: process.env.DEBUG == 'true',
        vuex: {
            store,
            actionPrefix: 'SOCKET_',
            mutationPrefix: 'SOCKET_'
        },
        connection: process.env.WEB_SERVER_LOCATION
    }));

    var app = new Vue({
        el: "#app",
        store: store,
        render: c => c(App)
    });
})