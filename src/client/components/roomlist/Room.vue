<template>
    <div class="card mt-4">
        <div class="card-header text-center"><i v-if="room.hasPassword" class="cil-lock-locked"></i> {{ room.name }}</div>
        <div class="card-body">
            <div class="card-text">
                <div>
                    <span>Players:</span>
                    <div class="data">
                        <span v-for="(player,index) in room.players" :key="player.user.id">
                            <username :user="player.user" /><span v-if="index != room.players.length - 1">,&nbsp;</span>
                        </span>
                    </div>
                </div>
                <div class="mt-3">
                    <span>Packs:</span>
                    <div class="data">
                        <small v-for="(packId, index) in room.packIds" :key="packId">
                            {{ serverPacks.get(packId).name }}<span v-if="index != room.packIds.length - 1">,&nbsp;</span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer text-muted d-flex align-items-center justify-content-between">
            <span class="">{{ room.players.length }} / {{ room.maxPlayers }} players</span>
            <button class="btn btn-primary" @click="$parent.joinRoom(room)">Join</button>
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
        computed: {
            serverPacks(): Map<String, Pack> {
                return this.$store.state.server.packs;
            }
        }
    });
</script>

<style scoped>
    .data {
        margin-left: 10px;
        max-height: 80px;
        overflow: hidden;
    }
</style>