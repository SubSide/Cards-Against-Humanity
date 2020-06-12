<template>
    <div class="position-relative">
        <div class="card bg-light text-dark cah-card" :class="{'border-dark': badge }">
            <div class="resizing" ref="text" v-html="text"></div>
            <div class="order badge badge-secondary" v-if="badge" v-html="badge"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../../common/models/Player';
    import Room from '../../../../common/models/Room';
    import { ResponseCard } from '../../../../common/models/Card';
    import textFit from '../../../js/textfit.min.js';
    

    export default Vue.extend({
        name: 'response-card',
        props: [ "card", "badge" ],
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
                return this.card.text;
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
    .order {
        position: absolute;
        bottom: -5px;
        left: -5px;
        font-size: 15px;
    }
</style>