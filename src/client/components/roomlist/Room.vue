<template>
    <div class="card">
        <div class="card-header text-center">{{ room.name }}</div>
        <div class="card-body">
            <p class="card-text">
                <div class="row">
                    <span>Players:&nbsp;</span>
                    <span v-for="player in room.players" :key="player.user.id">
                        <username :user="player.user" />, 
                    </span>
                </div>
                <div class="row">
                    <span>Packs:&nbsp;</span>
                    <small class="align-self-center" v-for="packId in room.packIds" :key="packId">{{ serverPacks.get(packId).name }}</small>
                </div>
            </p>
        </div>
        <div class="card-footer text-muted d-flex align-items-center justify-content-between">
            <span class="">{{ room.players.length }} / {{ room.maxPlayers }} players</span>
            <button class="btn btn-primary" @click="joinRoom(room.id)">Join</button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { JoinRoomPacket } from '../../../common/network/ClientPackets';
    import Pack from '../../../common/models/Pack';

    export default Vue.extend({
        name: 'room',
        props: [ 'room' ],
        methods: {
            joinRoom(roomId: string) {
                this.$socket.send(new JoinRoomPacket(roomId));
            }
        },
        computed: {
            serverPacks(): Map<String, Pack> {
                return this.$store.state.server.packs;
            }
        }
    });
</script>