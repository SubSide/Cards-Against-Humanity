<template>
    <div class="position-relative">
        <div class="card bg-dark text-white cah-card">
            <!-- <svg viewBox="0 0 225 350"> -->
            <svg v-bind:viewBox="viewBox">
                <switch>
                    <foreignObject width="100%" height="100%" 
                        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">
                        <p xmlns="http://www.w3.org/1999/xhtml" style="font-weight: bold" v-html="text"></p>
                    </foreignObject>
                    <text x="0" y="0">{{ text }}</text>
                </switch>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../../common/models/Player';
    import Room from '../../../../common/models/Room';
    import { PromptCard, ResponseCard } from '../../../../common/models/Card';
    

    export default Vue.extend({
        name: 'prompt-card',
        props: [ "card", 'played' ],
        computed: {
            id(): string {
                return this.card.id;
            },
            cardSize(): number {
                return (this.$store.state.settings.cardSize + 2) / 5;
            },
            width(): number {
                return 225 / this.cardSize;
            },
            height(): number {
                return 350 / this.cardSize;
            },
            viewBox(): string {
                return "0 0 "+this.width+" " + this.height;
            },
            text(): string {
                if (!this.shouldInlineCards || this.played == undefined || this.played.length == 0) 
                    return this.card.text;

                // var newText: string = this.card.text + this.card.text;
                var newText: string = this.card.text;
                this.played.forEach((card: ResponseCard) => {
                    newText = newText.replace(/\_{2,}/, `<span class="text-info">${card.text}</span>`); 
                })

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