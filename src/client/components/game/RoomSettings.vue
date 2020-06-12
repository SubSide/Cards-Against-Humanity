<template>
    <div class="row mt-4">
        <div class="col">
            <div class="row">
                <div class="col-12 col-md-6 form-group">
                    <label for="maxPlayers">Maximum amount of players: {{ maxPlayers }}</label>
                    <input
                        type="range"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model.number="maxPlayers"
                        min="3"
                        max="24"
                        id="maxPlayers"
                        name="maxPlayers" />
                </div>
                <div class="col-12 col-md-6 form-group">
                    <label for="pointsToWin">Points to win: {{ pointsToWin }}</label>
                    <input
                        type="range"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model.number="pointsToWin"
                        min="3"
                        max="50"
                        id="pointsToWin"
                        name="pointsToWin" />
                </div>
                <div class="col-12 col-md-6 form-group">
                    <label for="timeToRespond">Time to respond: {{ timeToRespondText }}</label>
                    <input
                        type="range"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model.number="$data.timeToRespond"
                        min="0"
                        max="30"
                        id="timeToRespond"
                        name="timeToRespond" />
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <h5>Card packs: <small class="text-muted">It is recommended to select a single main deck. (and just 1 as otherwise you get duplicates)</small></h5>
                    <div><button class="btn btn-primary" data-toggle="collapse" data-target="#packList"  aria-expanded="false" aria-controls="packList">Show/hide packs</button></div>
                    <div id="packList" class="row my-3 collapse" :class="{'show': canEdit}" v-for="group in packGroups" :key="group.title">
                        <div class="col-12 mb-1">{{ group.title }}</div>
                        <div class="col-12 col-md-6 pl-5" v-for="pack in group.packs" :key="pack.id">
                            <input type="checkbox" :id="pack.id" :value="pack.id" v-model="packIds" :disabled="!canEdit" />
                            <label :for="pack.id" :class="{ 'text-muted': !canEdit }">{{ pack.name }}</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <button class="btn btn-success" @click="startGame" :disabled="!canEdit">Start</button>
                </div>
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
    import Settings from '../../../common/models/Settings';
    import debounce from 'debounce';
    import { ChangeRoomSettingsPacket, StartGamePacket } from '../../../common/network/ClientPackets';
    import User from '../../../common/models/User';
    import Role from '../../../common/models/Role';
    import { PackGroup } from '../../../common/models/Pack';
        
    export default Vue.extend({
        name: 'room-settings',
        data: function() {
            return {
                maxPlayers: 0,
                pointsToWin: 0,
                timeToRespond: 0,
                packIds: [],
                initialized: false,
                debouncer: null
            }
        },
        watch: {
            maxPlayers: function() { this.sendSettingsChange() },
            pointsToWin: function() { this.sendSettingsChange() },
            timeToRespond: function() { this.sendSettingsChange() },
            packIds: function() { this.sendSettingsChange() },
            settings: function() {
                this.setSettings(this.settings);
            }
        },
        methods: { 
            setSettings(settings: Settings) {
                this.maxPlayers = settings.maxPlayers;
                this.pointsToWin = settings.pointsToWin;
                this.timeToRespond = settings.timeToRespond;
                this.packIds = settings.packIds;
            },
            sendSettingsChange() {
                if (!this.canEdit) return;
                this.$data.debouncer();
            },
            _sendSettingsChange() {
                if (!this.canEdit) return;
                this.$socket.send(new ChangeRoomSettingsPacket(this.createSettingsObject()));
            },
            createSettingsObject(): Settings {
                return {
                    maxPlayers: this.maxPlayers,
                    pointsToWin: this.pointsToWin,
                    timeToRespond: this.timeToRespond,
                    packIds: this.packIds
                }
            },
            startGame() {
                this.$socket.send(new StartGamePacket(this.createSettingsObject()));
            }
        },
        mounted: function() {
            this.$data.debouncer = debounce(this._sendSettingsChange.bind(this), 2000);
        },
        computed: {
            timeToRespondText(): string {
                var time = this.timeToRespond * 30;
                if (time == 0) {
                    return "Unlimited";
                }

                return Math.floor(time / 60)+" minutes " + (time % 60)+ " seconds";
            },
            self(): User {
                return this.$store.state.user;
            },
            canEdit(): boolean {
                return this.self.id == this.room.owner.id || this.$store.state.role >= Role.Staff;
            },
            room(): Room {
                let room = this.$store.state.game.room;
                this.setSettings(room.settings);
                return room;
            },
            settings(): Settings {
                return this.$store.state.game.settings;
            },
            packGroups(): PackGroup[] {
                return this.$store.state.server.packGroups;
            }
        }
    })
</script>

<style scoped>
    [type=range]:disabled {
        filter: grayscale(1);
        pointer-events: none;
    }

    .packs {
        font-size: 13px;
    }
</style>