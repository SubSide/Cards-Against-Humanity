<template>
    <div class="row pt-5">
        <div class="col-12">
            <div class="row">
                <div class="col-6 col-md-3 col-lg-2 mt-3">
                    <!-- Here we display the current prompt card -->
                    <prompt-card :text="promptCard.text" :played="allPlayersPlayed == 0 ? selectedCards : []" />
                </div>
                <div class="col-12 col-md-9 col-lg-10">
                    <!-- If not everyone has played their cards we show per player that played a card a response card with their name -->
                    <div class="row" v-if="allPlayersPlayed.length == 0">
                        <div class="col-6 col-lg-2 mt-3" v-for="player in playersThatPlayedCards" :key="player.user.id">
                            <response-card 
                                class="played font-italic font-weight-light" 
                                :text="player.user.username + ' played their card'+(promptCard.pick > 1 ? 's' : '')" />
                        </div>
                    </div>
                    <!-- Everyone played a card so we want to show everyones' cards -->
                    <div class="row" v-else>
                        <div 
                            v-for="playerCards in allPlayersPlayed"
                            class="col-6 col-md-4 col-lg-2 pt-2 mt-2 position-relative"
                            :class="{ 
                                'border border-secondary': czarPicked == playerCards[0].id && winnerCardId == null, 
                                'border border-success': winnerCardId == playerCards[0].id
                            }" 
                            :key="playerCards[0].id">
                            <div class="row move-down" @click="czarPick(playerCards[0].id)">
                                <div class="col-12 move-up">
                                    <!-- Show the prompt card per player -->
                                    <prompt-card :text="promptCard.text" :played="playerCards" />
                                </div>
                                <div class="col-12">
                                    <div class="row justify-content-center">
                                        <!-- And show their response cards -->
                                        <div class="col-6 p-1 move-up" v-for="card in playerCards" :key="card.id">
                                            <response-card :text="card.text" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- If this is the card the czar picked, we show a little marker badge above it -->
                            <div class="czar-pick text-center" v-if="czarPicked == playerCards[0].id || winnerCardId == playerCards[0].id">
                                <div class="badge badge-success">&#x2714;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- The play button -->
        <div class="col-12 mt-3">
            <button class="btn btn-primary" :disabled="!canPlay" @click="play">{{ playButtonText }}</button>
            <small class="ml-2" v-if="!isCzar">{{ czar.username }} is czar!</small>
        </div>
        <!-- The players' hand -->
        <div class="col-12 position-relative mt-3">
            <div class="row" :class="{ played: player.hasPlayedCards || isCzar }">
                <response-card 
                    class="col-4 col-md-3 col-lg-2 my-2"
                    v-for="card in cards" 
                    :key="card.id" 
                    :text="card.text"
                    :badge="badgeText(card)"
                    @click.native="cardPick(card)" />
            </div>
            <div class="czarIndication d-flex justify-content-center align-items-center" v-if="isCzar">
                <div class="alert alert-secondary w-100 text-center mx-2 p-3 font-weight-bold"><h3>You're the card czar!</h3></div>
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
                playingCards: [],
                czarPicked: null
            }
        },
        watch: {
            myCardsPlayed(playedCards: string[]) {
                this.playingCards = [...playedCards];
            },
            winnerCardId(winnerCardId) {
                if (this.winnerCardId != null)
                    this.czarPicked = null;
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
                return this.room.round;
            },
            allPlayersPlayed(): ResponseCard[][] {
                return this.round.cardsChosen || [];
            },
            winnerCardId(): string {
                return this.round.winnerCardId;
            },
            promptCard(): PromptCard {
                return this.round.promptCard;
            },
            playersThatPlayedCards(): Player[] {
                return this.room.players
                    .filter(player => player.hasPlayedCards);
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
                if (this.winnerCardId != null) {
                    return "Waiting for next round.";
                }

                if (this.isCzar) {
                    if (this.allPlayersPlayed.length == 0) {
                        return "You are the czar!";
                    } else {
                        if (this.czarPicked == null) {
                            return "Pick a winner";
                        } else {
                            return "Choose this as winner";
                        }
                    }
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
                if (this.winnerCardId != null) {
                    return false;
                }

                if (this.isCzar) {
                    if (this.allPlayersPlayed.length == 0 || this.czarPicked == null)
                        return false;
                    else return true;
                }
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
            czarPick: function(cardId: string) {
                if (!this.isCzar) return;
                if (this.round.winner != null) return;

                this.czarPicked = cardId;
            },
            badgeText: function(card: ResponseCard) {
                if (this.playingCards.indexOf(card.id) < 0) return null;
                if (this.promptCard.pick == 1) return "&#x2714;";
                return this.playingCards.indexOf(card.id) + 1;
            },
            play: function() {
                if (!this.isCzar)
                    this.$socket.send(new PlayCardPacket(this.playingCards));
                else
                    this.$socket.send(new PlayCardPacket([this.czarPicked]));
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
        opacity: 0.55;
    }

    .move-up {
        margin-bottom: -10px;
    }

    .move-down {
        margin-bottom: 10px;
    }
    .czar-pick {
        position: absolute;
        top: -20px;
        left: 0;
        right: 0;
        font-size: 20px;
        z-index: 5;
    }

    .czarIndication {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>