<template>
    <div class="body d-flex flex-column">
        <prompt ref="leavePrompt" :title="'Leaving room'" :content="'Are you sure you want to leave this room?'" :onConfirm="leaveRoom" />
        <div class="content">
            <div class="row">
                <div class="col-12">
                    <button class="btn btn-secondary" @click="openLeaveRoom">Leave room</button>
                </div>
            </div>
            <game v-if="room.round" />
            <room-settings v-else />
        </div>
        <player-list class="footer" />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import Game from './Game.vue';
    import RoomSettings from './RoomSettings.vue';
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
            openLeaveRoom() {
                (this.$refs.leavePrompt as any).show();
            },
            leaveRoom: function() {
                this.$socket.send(new LeaveRoomPacket());
            }
        },
        components: {
            'game': Game,
            'room-settings': RoomSettings,
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