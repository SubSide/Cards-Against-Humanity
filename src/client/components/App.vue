<template>
    <div class="container">
        <game v-if="currentRoom != null" />
        <room-list v-else />
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