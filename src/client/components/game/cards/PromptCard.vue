<template>
    <div class="position-relative">
        <div class="card bg-dark border-secondary text-white cah-card">
            <div class="resizing" :class="{ 'with-icon': showLogo }" ref="text" v-html="htmlText"></div>
            <div class="icon-holder" v-if="showLogo">
                <img class="icon" src="../../../assets/images/card_logo.svg" />
                <small class="text-muted">Cards Against Humanity</small>
            </div>
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
        props: [ "text", 'played' ],
        updated: function (){
            this.doTextFit();
        },
        mounted: function() {
            this.doTextFit();
        },
        watch: {
            cardSize: function() {
                this.doTextFit();
            }
        },
        methods: {
            doTextFit: function() {
                textFit(this.$refs.text, {
                    "maxFontSize": this.cardSize,
                    "multiLine": true
                });
            }
        },
        computed: {
            cardSize(): number {
                return 10 + this.$store.state.settings.cardSize;
            },
            showLogo(): boolean {
                return !this.$store.state.settings.hideLogo;
            },
            htmlText(): string {
                if (!this.shouldInlineCards || this.played == undefined || this.played.length == 0) 
                    return this.text;

                // var newText: string = this.card.text + this.card.text;
                var newText: string = this.text;
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

    .icon-holder {
        position: absolute;
        bottom: 2px;
        left: 2px;
        font-size: 8px;
    }

    .icon {
        width: 20%;
        margin-right: 5px;
    }

    .cah-card .resizing.with-icon {
        margin-bottom: 25px;
    }
</style>