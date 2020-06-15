<template>
    <div class="row pt-5">
        <div class="col-12">
            <div class="row">
                <div class="col-6 col-md-3 col-lg-2">
                    <prompt-card :card="promptCard" :played="selectedCards" />
                </div>
            </div>
        </div>
        <div class="col-12 mt-3">
            <button class="btn btn-primary" :disabled="!canPlay" @click="play">{{ playButtonText }}</button>
        </div>
        <div class="col-12 mt-3">
            <div class="row">
                <response-card 
                    class="col-6 col-md-3 col-lg-2 my-2" 
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
    import User from '../../../common/models/User';
import { PlayCardPacket } from '../../../common/network/ClientPackets';
    
    export default Vue.extend({
        name: 'game',
        data: function() {
            return {
                playingCards: []
            }
        },
        watch: {
            playedCards(playedCards: string[]) {
                this.playingCards = playedCards;
            }
        },
        mounted() {
            this.playingCards = this.playedCards || [];
        },
        computed: {
            player(): Player {
                return this.$store.state.game.player;
            },
            czar(): User {
                return this.$store.state.game.round.czar;
            },
            isCzar(): boolean {
                return this.czar.id == this.player.user.id;
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
            playedCards(): string[] {
                return this.$store.state.game.playedCards;
            },
            selectedCards: function(): ResponseCard[] {
                return this.playingCards.map((id: string) => this.cards.find(card => card.id == id))
            },
            playButtonText: function(): string {
                if (this.isCzar) {
                    return "You are the czar!";
                }

                if (this.playedCards != null && this.playedCards.length > 0) {
                    return "Cards played";
                }

                if (this.selectedCards.length < this.promptCard.pick) {
                    return `Pick ${this.promptCard.pick} card`+ ((this.promptCard.pick > 1) ? "s" : "")
                }

                return "Play";
            },
            canPlay: function(): boolean {
                if (this.isCzar) return false;
                if (this.playedCards != null && this.playedCards.length > 0) return false;

                return this.selectedCards.length == this.promptCard.pick;
            }
        },
        methods: {
            cardPick: function(card: ResponseCard) {
                if (this.isCzar) return;
                if (this.playedCards != null && this.playedCards.length > 0) return;

                if (this.promptCard.pick == 1) {
                    if (this.playingCards.indexOf(card.id) < 0) {
                        this.playingCards = [card.id];
                    } else {
                        this.playingCards = [];
                    }
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
            play: function() {
                this.$socket.send(new PlayCardPacket(this.playingCards));
            }
        },
        components: {
            'response-card': ResponseCardVue,
            'prompt-card': PromptCardVue
        }
    })
</script>