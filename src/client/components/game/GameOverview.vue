<template>
    <div class="body d-flex flex-column">
        <prompt ref="leavePrompt" :title="'Leaving room'" :content="'Are you sure you want to leave this room?'" :onConfirm="leaveRoom" />
        <div class="modal fade" id="roomSettingsModal" tabindex="-1" role="dialog" aria-labelledby="roomSettingsLabel" aria-hidden="true">
            <div id="loginForm" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="roomSettingsLabel">Room settings</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <room-settings />
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="content mt-3">
            <div class="row">
                <div class="col-12">
                    <button class="btn btn-secondary" @click="openLeaveRoom">Leave room</button>
                    <button type="button" v-if="room.round" class="btn btn-secondary ml-2" data-toggle="modal" data-target="#roomSettingsModal">Settings</button>
                </div>
            </div>
            <game v-if="room.round" />
            <room-settings v-else />
        </div>
        <player-list class="footer" />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Player from '../../../common/models/Player';
    import Room from '../../../common/models/Room';
    import Game from './Game.vue';
    import RoomSettings from './RoomSettings.vue';
    import { LeaveRoomPacket } from '../../../common/network/ClientPackets';
    import PlayerList from './PlayerList.vue';
    import ding from '../../assets/sounds/ding.wav';

    var isTabActive: boolean;

    window.onfocus = function () { 
        isTabActive = true; 
    }; 

    window.onblur = function () { 
        isTabActive = false; 
    };
    
    export default Vue.extend({
        name: 'gameOverview',
        data: function() {
            return {
                currentState: State.IN_SETTINGS,
                sound: new Audio(ding),
            }
        },
        watch: {
            state: function(newValue, oldValue) {
                if (oldValue == newValue) return;

                switch (this.soundBackgroundType) {
                    case 'background':
                        if (!document.hidden) return;
                        break;
                    case 'outOfFocus':
                        if (isTabActive) return;
                        break;
                    case 'always':
                        break;
                }

                if (this.playSound == "relevant") {
                    console.debug("State: ", newValue , ", isCzar: ", this.isCzar);
                    switch (newValue) {
                        case State.IN_SETTINGS:
                            break;
                        case State.PLAYING:
                            if (this.isCzar) return;
                            break;
                        case State.CHOOSING:
                            if (!this.isCzar) return;
                            break;
                        case State.WINNER:
                            if (this.isCzar) return;
                            break;
                    }
                } else if (this.playSound == "always") {
                } else {
                    return;
                }

                this.sound.play();
            },
            soundVolume(value: number) {
                this.sound.volume = value;
            }
        },
        computed: {
            room(): Room {
                return this.$store.state.game.room;
            },
            state(): State {
                if (this.room.round == null) return State.IN_SETTINGS;
                if (this.room.round.cardsChosen == null) return State.PLAYING;
                if (this.room.round.winner == null) return State.CHOOSING;
                
                return State.WINNER;
            },
            isCzar(): boolean {
                return this.room.round != null && this.room.round.czar.id == this.$store.state.user.id;
            },
            playSound(): string {
                return this.$store.state.settings.playSound;
            },
            soundVolume(): number {
                return this.$store.state.settings.soundVolume;
            },
            soundBackgroundType(): string {
                return this.$store.state.settings.soundBackgroundType;
            }
        },
        methods: {
            openLeaveRoom() {
                (this.$refs.leavePrompt as any).show();
            },
            leaveRoom: function() {
                this.$socket.send(new LeaveRoomPacket());
            }
        },
        components: {
            'game': Game,
            'room-settings': RoomSettings,
            'player-list': PlayerList
        }
    });

    enum State {
        IN_SETTINGS,
        PLAYING,
        CHOOSING,
        WINNER,
    }
</script>

<style scoped>
    .body {
        height: 100%;
    }

    .footer {
        flex-shrink: 0;
    }

    .content {
        flex: 1 0 auto;
    }
</style>