<template>
    <div class="card-holder d-flex flex-wrap-reverse pt-5 justify-content-center">
        <div 
            v-for="(player, index) in players" 
            class="card d-inline-block p-3 pb-4" 
            :class="{ 
                'bg-success text-white': player.user.id == roundWinnerId,
                'bg-danger text-white':  player.user.id == czar, 
                'bg-primary text-white': player.user.id == self.user.id && player.user.id != czar && player.user.id != roundWinnerId
            }" 
            :style="{ 'z-index': (1000-index) }" 
            :key="player.user.id">
            <username :user="player.user" />
            <br />
            <small class="float-left pr-1">{{ player.points }} points</small>
            <small class="float-right pl-1" v-if="room.round && !player.hasPlayedCards && player.user.id != czar">(Playing)</small>
            <small class="float-right pl-1" v-if="room.round && player.user.id == czar">(Czar)</small>
            <small class="float-right px-1" v-if="player.user.id == room.owner.id">(Host)</small>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import Role from '../../../common/models/Role';
    
    export default Vue.extend({
        name: 'PlayerList',
        computed: {
            self(): Player {
                return this.$store.state.game.player;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            roundWinnerId(): string {
                if (this.room.round == null || this.room.round.winner == null) return null;
                return this.room.round.winner.id;
            },
            czar(): string {
                return this.room.round?.czar?.id;
            },
            players(): Player[] {
                return this.room.players;
            }
        }
    })
</script>

<style scoped>
    .card-holder {
        overflow: hidden;
    }
    .card {
        margin-bottom: -15px;
    }
</style>