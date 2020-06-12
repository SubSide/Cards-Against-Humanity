<template>
    <div class="position-relative">
        <div class="card bg-dark border-secondary text-white cah-card">
            <div class="resizing" ref="text" v-html="text"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../../common/models/Player';
    import Room from '../../../../common/models/Room';
    import { PromptCard, ResponseCard } from '../../../../common/models/Card';
    import textFit from '../../../js/textfit.min.js';


    export default Vue.extend({
        name: 'prompt-card',
        props: [ "card", 'played' ],
        updated: function (){
            textFit(this.$refs.text, {
                "maxFontSize": this.cardSize
            });
        },
        watch: {
            cardSize: function() {
                textFit(this.$refs.text, {
                    "maxFontSize": this.cardSize
                });
            }
        },
        computed: {
            id(): string {
                return this.card.id;
            },
            cardSize(): number {
                return 10 + this.$store.state.settings.cardSize;
            },
            text(): string {
                if (!this.shouldInlineCards || this.played == undefined || this.played.length == 0) 
                    return this.card.text;

                // var newText: string = this.card.text + this.card.text;
                var newText: string = this.card.text;
                if (newText.match(/\_{2,}/)) {
                    this.played.forEach((card: ResponseCard) => {
                        newText = newText.replace(/\_{2,}/, `<span class="text-info">${card.text}</span>`); 
                    })
                } else {
                    newText += this.played
                        .map((card: ResponseCard) => ` <span class="text-info">${card.text}</span>`)
                        .join(" ");
                }

                return newText;
            },

            shouldInlineCards(): boolean {
                return this.$store.state.settings.inlineCards;
            }
        }
    })
</script>

<style scoped>
    .cah-card {
        padding-top: 130%;
        width: 100%;
        position: relative;
    }
    .cah-card svg, .cah-card .resizing {
        position: absolute;
        margin: 5px;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>