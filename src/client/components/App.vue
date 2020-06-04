<template>
    <div class="body">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">CAH</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Dropdown
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a class="dropdown-item" href="#">Action</a>
                            <a class="dropdown-item" href="#">Another action</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="#">Something else here</a>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link disabled" href="#">Disabled</a>
                    </li>
                </ul>
                <form class="form-inline my-2 my-lg-0">
                    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                </form>
            </div>
        </nav>
        <div class="container">
            <game v-if="currentRoom != null" />
            <room-list v-else />
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

    const STORAGE_PREVIOUS_ID = 'STORAGE_PREVIOUS_ID';

    export default Vue.extend({
        components: { 
            'room-list': RoomList,
            'game': Game
        },
        computed: {
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
            errorPacket: function(packet: ErrorPacket) {}
        }
    });
    
</script>