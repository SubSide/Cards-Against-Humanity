<template>
    <div class="row">
        <div class="col-12">
            {{ room }}
        </div>
        <div class="col">
            <div class="form-group">
                <label for="maxPlayers">Maximum amount of players:</label>
                <input
                    type="range"
                    class="form-control"
                    id="maxPlayers"
                    name="maxPlayers" />
            </div>
            <div class="form-group">
                <label for="pointsToWin">Points to win:</label>
                <input
                    type="range"
                    class="form-control"
                    id="pointsToWin"
                    name="pointsToWin" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    /*
    maxPlayers: number;
    pointsToWin: number;
    timeToRespond: number;
    packIds: string[];
    */
    import Vue from 'vue';
    import Room from '../../../common/models/Room';
    
    export default Vue.extend({
        name: 'room-settings',
        data: function() {
            return {
                settings: {},
            }
        },
        computed: {
            room(): Room {
                let room = this.$store.state.game.room;
                this.$data.settings = room.settings;
                return room;
            }
        }
    })
</script>