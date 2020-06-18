<template>
    <div class="row pt-5">
        <div class="col-12">
            <div class="row">
                <div class="col-6 col-md-3 col-lg-2 mt-3">
                    <prompt-card :card="promptCard" :played="allPlayersPlayed == 0 ? selectedCards : []" />
                </div>
                <div class="col-6 col-md-9 col-lg-10">
                    <div class="row" v-if="allPlayersPlayed.length == 0">
                        <div class="col-12 col-md-4 col-lg-3 mt-3" v-for="card in playerCardsPlayed" :key="card.id">
                            <response-card class="played font-italic font-weight-light" :card="card" />
                        </div>
                    </div>
                    <div class="row" v-else>
                        <div class="col-12 col-md-4 col-lg-2 mt-3" v-for="playerCards in allPlayersPlayed" :key="playerCards[0].id">
                            <div class="row move-down">
                                <div class="col-12 move-up">
                                    <prompt-card :card="promptCard" :played="playerCards" />
                                </div>
                                <div class="col-12">
                                    <div class="row justify-content-center">
                                        <div class="col-6 p-1 move-up" v-for="card in playerCards" :key="card.id">
                                            <response-card :card="card" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 mt-3">
            <button class="btn btn-primary" :disabled="!canPlay" @click="play">{{ playButtonText }}</button>
        </div>
        <div class="col-12 mt-3" :class="{ played: player.hasPlayedCards || isCzar }">
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
import Round from '../../../common/models/Round';
    
    export default Vue.extend({
        name: 'game',
        data: function() {
            return {
                playingCards: []
            }
        },
        watch: {
            myCardsPlayed(playedCards: string[]) {
                this.playingCards = [...playedCards];
            }
        },
        mounted() {
            if (this.myCardsPlayed != null) {
                this.playingCards = [...this.myCardsPlayed];
            } else {
                this.playingCards = [];
            }
        },
        computed: {
            player(): Player {
                return this.$store.state.game.player;
            },
            czar(): User {
                return this.round.czar;
            },
            isCzar(): boolean {
                return this.czar.id == this.player.user.id;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            round(): Round {
                return this.$store.state.game.round;
            },
            allPlayersPlayed(): ResponseCard[][] {
                return this.round.cardsChosen || [];
            },
            promptCard(): PromptCard {
                return this.round.promptCard;
            },
            playerCardsPlayed(): ResponseCard[] {
                // We're using PromptCard to make it easier
                return this.room.players
                    .filter(player => player.hasPlayedCards)
                    .map(player => {
                        return {
                            type: 'response',
                            id: player.user.id,
                            text: player.user.username + " played their card"+(this.promptCard.pick > 1 ? "s" : "")
                        }
                    });
            },
            cards(): ResponseCard[] {
                return this.$store.state.game.cards;
            },
            myCardsPlayed(): string[] {
                return this.$store.state.game.playedCards;
            },
            selectedCards: function(): ResponseCard[] {
                return this.playingCards.map((id: string) => this.cards.find(card => card.id == id))
            },
            playButtonText: function(): string {
                if (this.isCzar) {
                    return "You are the czar!";
                }

                if (this.myCardsPlayed != null && this.myCardsPlayed.length > 0) {
                    return "Cards played";
                }

                if (this.selectedCards.length < this.promptCard.pick) {
                    return `Pick ${this.promptCard.pick} card`+ ((this.promptCard.pick > 1) ? "s" : "")
                }

                return "Play";
            },
            canPlay: function(): boolean {
                if (this.isCzar) return false;
                if (this.myCardsPlayed != null && this.myCardsPlayed.length > 0) return false;

                return this.selectedCards.length == this.promptCard.pick;
            }
        },
        methods: {
            cardPick: function(card: ResponseCard) {
                if (this.isCzar) return;
                if (this.myCardsPlayed != null && this.myCardsPlayed.length > 0) return;

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

<style scoped>
    .played {
        opacity: 0.65;
    }

    .move-up {
        margin-bottom: -10px;
    }

    .move-down {
        margin-bottom: 10px;
    }
</style>