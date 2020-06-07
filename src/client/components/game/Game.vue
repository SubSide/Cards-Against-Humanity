<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <card class="col-6 col-md-3 col-lg-2 my-1" v-for="card in cards" :key="card.id" :card="card" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import { PromptCard, ResponseCard } from '../../../common/models/Card';
    import Card from './Card.vue';
    
    export default Vue.extend({
        name: 'game',
        computed: {
            player(): Player {
                return this.$store.state.game.player;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            cards(): ResponseCard[] {
                return this.$store.state.game.cards;
            }
        },
        components: {
            'card': Card
        }
    })
</script>