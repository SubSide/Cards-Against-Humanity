<template>
    <div class="body d-flex flex-column">
        <div class="content">
            <div class="col-12">
                <button class="btn btn-secondary" @click="leaveRoom">Leave room</button>
            </div>
            <game v-if="room.round" />
            <game-settings v-else />
        </div>
        <player-list class="footer" />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import Game from './Game.vue';
    import GameSettings from './GameSettings.vue';
    import { LeaveRoomPacket } from '../../../common/network/ClientPackets';
    import PlayerList from './PlayerList.vue';
    
    export default Vue.extend({
        name: 'gameOverview',
        computed: {
            room(): Room {
                return this.$store.state.game.room;
            },
        },
        methods: {
            leaveRoom: function() {
                this.$socket.send(new LeaveRoomPacket());
            }
        },
        components: {
            'game': Game,
            'game-settings': GameSettings,
            'player-list': PlayerList
        }
    })
</script>

<style scoped>
    .body {
        height: 100%;
    }

    .footer {
        flex-shrink: 0;
    }

    .content {
        flex: 1 0 auto;
    }
</style>