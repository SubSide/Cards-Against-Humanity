<template>
    <div class="body">
        <div class="navbar navbar-expand-sm navbar-light bg-light">
            <span class="navbar-brand order-0" href="#">CAH</span>
            <div class="collapse navbar-collapse order-sm-0 order-10 mx-5" id="navbarSupportedContent">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link 1</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link 2</a>
                    </li>
                </ul>
            </div>
            <div class="nav-item mx-auto"></div>
            <div class="navbar-nav dropdown">
                <div class="navbar-text order-4 btn btn-link dropdown-toggle" id="navbarDropdown" data-toggle="dropdown" aria-haspopup="false" aria-expanded="false">
                    <username :user="user" />
                </div>
                <div class="dropdown-menu dropdown-menu-right" style="position: absolute" aria-labelledby="navbarDropdown">
                    <button class="dropdown-item btn btn-text" data-toggle="modal" data-target="#changeUsernameDialog">Change username</button>
                    <!-- <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a> -->
                </div>
            </div>
            <button class="navbar-toggler order-6" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="container">
            <login />
            <game v-if="currentRoom != null" />
            <room-list v-else />
            <error-toast />
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import sessionStorage from 'sessionstorage';
    import { SocketChangePacket, RequestStateUpdatePacket } from '../../common/network/ClientPackets';
    import { ErrorPacket } from '../../common/network/ServerPackets';
    import RoomList from './roomlist/RoomList.vue';
    import Game from './game/Game.vue';
    import { User } from '../../common/models/User';
    import { Room } from '../../common/models/Room';
    import { mapGetters } from 'vuex';
    import Login from './common/Login.vue';
    import ErrorToast from './utils/ErrorToast.vue';
    import Username from './utils/Username.vue';

    const STORAGE_PREVIOUS_ID = 'STORAGE_PREVIOUS_ID';

    export default Vue.extend({
        components: { 
            'room-list': RoomList,
            'game': Game,
            'login': Login,
            'error-toast': ErrorToast,
            'username': Username
        },
        computed: {
            user(): User {
                return this.$store.state.user;
            },
            currentRoom(): Room {
                return this.$store.state.game.room;
            }
        },
        sockets: {
            connect: function() {
                let id = sessionStorage.getItem(STORAGE_PREVIOUS_ID);
                sessionStorage.setItem(STORAGE_PREVIOUS_ID, this.$socket.id);
                if (id != undefined && id != "undefined" && this.$socket.id !== id) {
                    this.$socket.send(new SocketChangePacket(id));
                }
            },
            errorPacket: function(packet: ErrorPacket) {
                $("#toast-holder").toast()
            }
        }
    });
    
</script>