<template>
    <div class="position-relative">
        <div class="card cah-card" :class="{'border-dark': badge }">
            <!-- <svg viewBox="0 0 225 350"> -->
            <svg v-bind:viewBox="viewBox">
                <switch>
                    <foreignObject width="100%" height="100%" 
                        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">
                        <p xmlns="http://www.w3.org/1999/xhtml" style="font-weight: bold">{{ text }}</p>
                    </foreignObject>
                    <text x="0" y="0">{{ text }}</text>
                </switch>
            </svg>
            <div class="order badge badge-secondary" v-if="badge" v-html="badge"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../../common/models/Player';
    import Room from '../../../../common/models/Room';
    import { ResponseCard } from '../../../../common/models/Card';
    

    export default Vue.extend({
        name: 'response-card',
        props: [ "card", "badge" ],
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
    .cah-card svg {
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