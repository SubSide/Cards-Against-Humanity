<template>
    <div class="body d-flex flex-column">
        <div class="navbar navbar-expand-sm" :class="{ 'navbar-dark bg-dark': !isLightTheme, 'navbar-light bg-light': isLightTheme }">
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
                    <username :user="user" :tagSide="left" />
                </div>
                <div class="dropdown-menu dropdown-menu-right" style="position: absolute" aria-labelledby="navbarDropdown">
                    <button class="dropdown-item btn btn-text" data-toggle="modal" data-target="#changeUsernameDialog">Change username</button>
                    <button class="dropdown-item btn btn-text" data-toggle="modal" data-target="#settingsDialog">Settings</button>
                    <!-- <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a> -->
                </div>
            </div>
            <button class="navbar-toggler order-6" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="container position-relative">
            <user-management />
            <login />
            <settings />
            <game-overview v-if="currentRoom != null" />
            <room-list v-else />
            <toasts />
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import sessionStorage from 'sessionstorage';
    import { SocketChangePacket, RequestStateUpdatePacket } from '../../common/network/ClientPackets';
    import { ErrorPacket } from '../../common/network/ServerPackets';
    import RoomList from './roomlist/RoomList.vue';
    import GameOverview from './game/GameOverview.vue';
    import User from '../../common/models/User';
    import Room from '../../common/models/Room';
    import { mapGetters } from 'vuex';
    import Login from './common/Login.vue';
    import Toasts from './toasts/ToastHolder.vue';
    import Settings from './common/Settings.vue';
    import UserManagement from './common/UserManagement.vue';

    const STORAGE_PREVIOUS_ID = 'STORAGE_PREVIOUS_ID';

    export default Vue.extend({
        components: { 
            'room-list': RoomList,
            'game-overview': GameOverview,
            'login': Login,
            'toasts': Toasts,
            'settings': Settings,
            'user-management': UserManagement
        },
        computed: {
            left(): string {
                return "left";
            },
            user(): User {
                return this.$store.state.user;
            },
            currentRoom(): Room {
                return this.$store.state.game.room;
            },
            isLightTheme(): boolean {
                return this.$store.state.settings.lightTheme;
            }
        },
        watch: {
            isLightTheme: function() {
                this.doTheming();
            }
        },
        mounted: function() {
            this.doTheming();
        },
        methods: {
            doTheming: function() {
                // var theme = "";
                // if (this.isLightTheme) {
                //     theme = "//stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css";
                // } else {
                //     theme = "./assets/css/darkly-bootstrap.min.css";
                // }
                if (this.isLightTheme) {
                    $("#darkTheme").attr("disabled", "disabled");
                    $("#lightTheme").removeAttr("disabled");
                } else {
                    $("#darkTheme").removeAttr("disabled");
                    $("#lightTheme").attr("disabled", "disabled");
                }
            }
        },
        sockets: {
            connect: function() {
                let id = sessionStorage.getItem(STORAGE_PREVIOUS_ID);
                sessionStorage.setItem(STORAGE_PREVIOUS_ID, this.$socket.id);
                if (id != undefined && id != "undefined" && this.$socket.id !== id) {
                    this.$socket.send(new SocketChangePacket(id));
                } else {
                    this.$socket.send(new RequestStateUpdatePacket());
                }
            }
        }
    });
    
</script>

<style scoped>
    .body {
        height: 100%;
    }

    .navbar {
        flex-shrink: 0;
    }

    .container {
        flex: 1 0 auto;
    }
</style>