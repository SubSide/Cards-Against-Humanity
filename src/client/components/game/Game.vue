<template>
    <div class="row pt-5">
        <div class="col-12">
            <div class="row">
                <div class="col-6 col-md-3 col-lg-2">
                    <prompt-card :card="promptCard" :played="selectedCards" />
                </div>
            </div>
        </div>
        <div class="col-12 mt-5">
            <div class="row">
                <response-card 
                    class="col-6 col-md-3 col-lg-2 my-1" 
                    v-for="card in cards" 
                    :key="card.id" 
                    :card="card" 
                    :badge="badgeText(card)"
                    @click.native="cardPick(card)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import { PromptCard, ResponseCard } from '../../../common/models/Card';
    import ResponseCardVue from './cards/ResponseCard.vue';
    import PromptCardVue from './cards/PromptCard.vue';
    
    export default Vue.extend({
        name: 'game',
        data: function() {
            return {
                playingCards: []
            }
        },
        computed: {
            player(): Player {
                return this.$store.state.game.player;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            promptCard(): PromptCard {
                return this.$store.state.game.round.promptCard;
            },
            cards(): ResponseCard[] {
                return this.$store.state.game.cards;
            },
            selectedCards: function(): ResponseCard[] {
                return this.playingCards.map((id: string) => this.cards.find(card => card.id == id))
            }
        },
        methods: {
            cardPick: function(card: ResponseCard) {
                if (this.promptCard.pick == 1) {
                    this.playingCards = [card.id];
                    return;
                }

                if (this.playingCards.indexOf(card.id) < 0) {
                    if (this.playingCards.length >= this.promptCard.pick) {
                        return;
                    }

                    this.playingCards.push(card.id);
                } else {
                    this.playingCards.splice(this.playingCards.indexOf(card.id), 1);
                }
            },
            badgeText: function(card: ResponseCard) {
                if (this.playingCards.indexOf(card.id) < 0) return null;
                if (this.promptCard.pick == 1) return "&#x2714;";
                return this.playingCards.indexOf(card.id) + 1;
            },
        },
        components: {
            'response-card': ResponseCardVue,
            'prompt-card': PromptCardVue
        }
    })
</script>