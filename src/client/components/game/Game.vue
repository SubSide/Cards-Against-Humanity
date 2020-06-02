<template>
    <div class="row">
        {{ player }}<br />
        {{ room }}<br />
        {{ cards }}
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Player } from '../../../common/models/Player';
    import { Room } from '../../../common/models/Room';
    import { WhiteCard } from '../../../common/models/Card';
    
    export default Vue.extend({
        name: 'game',
        computed: {
            player(): Player {
                return this.$store.state.game.player;
            },
            room(): Room {
                return this.$store.state.game.room;
            },
            cards(): WhiteCard[] {
                return this.$store.state.game.cards;
            }
        }
    })
</script>