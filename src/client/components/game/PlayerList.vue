<template>
    <div class="card-holder d-flex flex-wrap-reverse justify-content-center">
        <div 
            class="card d-inline-block p-3 pb-4" 
            :class="{ 'bg-info text-white':  self.user.id == czar, 'bg-secondary text-white': player.user.id == self.user.id && player.user.id != czar }" 
            v-for="(player, index) in players" 
            :style="{ 'z-index': (1000-index) }" 
            :key="player.username">
            <username :user="player.user" />
            <span v-if="room.round && !player.hasPlayedCard">(Playing)</span>
            <br />
            <small>{{ player.points }} points</small>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Username from '../utils/Username.vue';
    import Room from '../../../common/models/Room';
    import Role from '../../../common/models/Role';
    import { Type } from '../../../common/models/Tag';
    
    export default Vue.extend({
        name: 'PlayerList',
        computed: {
            self(): Player {
                return this.$store.state.game.player;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            czar(): string {
                return this.room.round?.czar?.user.id;
            },
            players(): Player[] {
                return this.room.players;
                // let list: Player[] = this.room.players.slice(0, 1);
                // for (var i = 0; i < 24; i++) {
                //     let randHash = Math.random().toString(36).substring(2);
                //     if (Math.random() < 0.5) {
                //         randHash = "";
                //     }
                //     list.push({
                //         user: { 
                //             id: randHash,
                //             username: Math.random().toString(36).substring(2, 8 + Math.floor(Math.random() * 8)),
                //             hash: randHash,
                //             tags: [{
                //                 text: "Test",
                //                 type: Type.Primary
                //             }]
                //         },
                //         points: Math.floor(Math.random() * 8),
                //         hasPlayedCard: Math.floor(Math.random() * 2) == 1
                //     });
                // }
                // return list;
            }
        },
        components: {
            'username': Username
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