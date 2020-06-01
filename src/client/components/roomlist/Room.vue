<template>
    <div class="card">
        <div class="card-header text-center">{{ room.settings.name }}</div>
        <div class="card-body">
            <p class="card-text">Room settings like packs</p>
        </div>
        <div class="card-footer text-muted d-flex align-items-center justify-content-between">
            <span class="">{{ room.playerCount }} / {{ room.settings.maxPlayers }} players</span>
            <button class="btn btn-primary" @click="joinRoom(room.id)">Join</button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { JoinRoomPacket } from '../../../common/network/ClientPackets';

    export default Vue.extend({
        name: 'room',
        props: [ 'room' ],
        methods: {
            joinRoom(roomId: string) {
                console.debug(roomId);
                this.$socket.send(new JoinRoomPacket(roomId));
            }
        }
    });
</script>