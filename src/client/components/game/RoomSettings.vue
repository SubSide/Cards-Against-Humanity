<template>
    <div class="row mt-4">
        <div class="col">
            <div class="row">
                <p class="col-12">
                    Change your settings here. You'll need at least 3 players to start the game.
                </p>
                <div class="col-12 col-md-6 form-group">
                    <label :for="idPrefix+'maxPlayers'">Maximum amount of players: {{ maxPlayers }}</label>
                    <input
                        type="range"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model.number="maxPlayers"
                        min="3"
                        max="24"
                        :id="idPrefix+'maxPlayers'"
                        name="maxPlayers" />
                </div>
                <div class="col-12 col-md-6 form-group">
                    <label :for="idPrefix+'pointsToWin'">Points to win: {{ pointsToWin }}</label>
                    <input
                        type="range"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model.number="pointsToWin"
                        min="3"
                        max="50"
                        :id="idPrefix+'pointsToWin'"
                        name="pointsToWin" />
                </div>
                <div class="col-12 col-md-6 form-group">
                    <label :for="idPrefix+'password'">Password:</label>
                    <input
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        :disabled="!canEdit"
                        v-model="password"
                        pattern="[a-zA-Z0-9 ]{0,32}"
                        min="0"
                        max="16"
                        :id="idPrefix+'password'"
                        name="password" />
                        
                    <input type="checkbox"
                        v-model="showPassword"
                        :id="idPrefix+'showPassword'"
                        name="showPassword" />
                    <label :for="idPrefix+'showPassword'">Show Password</label>
                </div>
                <div class="col-12 col-md-6 form-group">
                    <label :for="idPrefix+'inviteField'">Invite link:</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <button class="btn btn-primary" :disabled="!inviteUrl" @click="copyInvite" type="button">Copy</button>
                        </div>
                        <input
                            type="text"
                            class="form-control"
                            readonly="readonly"
                            ref="inviteField"
                            :id="idPrefix+'inviteField'"
                            @click="selectAll"
                            v-model="inviteUrl" />
                        <div class="input-group-append" v-if="canEdit">
                            <button class="btn btn-primary" @click="refreshInvite" type="button">{{ inviteUrl ? 'Refresh' : 'Create'}}</button>
                        </div>
                        <div class="input-group-append" v-if="canEdit">
                            <button class="btn btn-danger" @click="removeInvite" type="button">X</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <h5>Card packs:</h5>
                    <div><button class="btn btn-primary" data-toggle="collapse" data-target="#packList"  aria-expanded="false" aria-controls="packList">Show/hide packs</button></div>
                    <div id="packList" class="collapse" :class="{'show': canEdit}">
                        <h5><small class="text-muted">The main decks have a lot of cards in common with each other. To prevent getting a lot of duplicates, I recommend just selecting a single one.</small></h5>
                        <div class="row my-3" v-for="group in packGroups" :key="group.title">
                            <div class="col-12 mb-1">{{ group.title }}</div>
                            <div class="col-12 col-md-6 pl-5" v-for="pack in group.packs" :key="pack.id">
                                <input type="checkbox" :id="idPrefix+pack.id" :value="pack.id" v-model="packIds" :disabled="!canEdit" />
                                <label :for="idPrefix+pack.id" :class="{ 'text-muted': !canEdit }">{{ pack.name }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col">
                    <button class="btn btn-success" @click="startGame" :disabled="!canStartGame">{{startButtonText}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Room from '../../../common/models/Room';
    import Settings from '../../../common/models/Settings';
    import debounce from 'debounce';
    import { ChangeRoomSettingsPacket, StartGamePacket, RefreshInviteLinkPacket } from '../../../common/network/ClientPackets';
    import User from '../../../common/models/User';
    import Role from '../../../common/models/Role';
    import { PackGroup } from '../../../common/models/Pack';
    import { hasSettingsChanged, areArraysTheSame } from '../../../common/utils/SettingsUtils';
        
    var uniquePrefix = 1;
    export default Vue.extend({
        name: 'room-settings',
        data: function() {
            return {
                maxPlayers: 0,
                pointsToWin: 0,
                password: null,
                packIds: [],
                inviteId: null,
                debouncer: null,
                showPassword: false,
                settings: null,
                idPrefix: (uniquePrefix++).toString(36)
            }
        },
        watch: {
            maxPlayers: function(newValue) {
                if (this.settings.maxPlayers != newValue) this.sendSettingsChange(); 
            },
            pointsToWin: function(newValue) {
                if (this.settings.pointsToWin != newValue) this.sendSettingsChange(); 
            },
            password: function(newValue) {
                if (this.room.password != newValue) this.sendSettingsChange();
            },
            packIds: function(newValue: string[]) {
                if (areArraysTheSame(this.settings.packIds, newValue)) {
                    return;
                }

                // there are changes! Let's send!
                this.sendSettingsChange(); 
            },
            settings: function(newValue: Settings, oldValue: Settings) {
                if (hasSettingsChanged(oldValue, newValue)) {
                    this.setSettings(this.settings);
                }
            },
        },
        methods: { 
            setSettings(settings: Settings) {
                this.maxPlayers = settings.maxPlayers;
                this.pointsToWin = settings.pointsToWin;
                this.packIds = settings.packIds;
            },
            sendSettingsChange() {
                if (!this.canEdit) return;
                this.$data.debouncer();
            },
            _sendSettingsChange() {
                if (!this.canEdit) return;
                this.$socket.send(new ChangeRoomSettingsPacket(this.createSettingsObject(), this.password));
            },
            createSettingsObject(): Settings {
                return {
                    maxPlayers: this.maxPlayers,
                    pointsToWin: this.pointsToWin,
                    packIds: this.packIds
                }
            },
            startGame() {
                this.$socket.send(new StartGamePacket(this.createSettingsObject()));
            },
            refreshInvite() {
                this.$socket.send(new RefreshInviteLinkPacket(false));
            },
            removeInvite() {
                this.$socket.send(new RefreshInviteLinkPacket(true));
            },
            copyInvite() {
                this.$refs.inviteField.select();
                document.execCommand('copy');
            },
            selectAll() {
                this.$refs.inviteField.focus();
                this.$refs.inviteField.select();
            }
        },
        mounted: function() {
            this.$data.debouncer = debounce(this._sendSettingsChange.bind(this), 2000);
        },
        computed: {
            self(): User {
                return this.$store.state.user;
            },
            canEdit(): boolean {
                return this.self.id == this.room.owner.id || this.$store.state.role >= Role.Staff;
            },
            canStartGame(): boolean {
                if (!this.canEdit) return false;
                if (this.room.players.length < 3) {
                    return false;
                }
                if (this.packIds.length < 1) {
                    return false;
                }
                return true;
            },
            startButtonText(): string {
                if (this.room.players.length < 3) {
                    return "You need at least 3 players";
                }

                if (this.packIds.length < 1) {
                    return "You need to pick at least 1 pack";
                }

                return "Start game";
            },
            room(): Room {
                let room: Room = this.$store.state.game.room;
                this.password = room.password;
                this.inviteId = room.inviteId;
                this.settings = room.settings;
                return room;
            },
            packGroups(): PackGroup[] {
                return this.$store.state.server.packGroups;
            },
            inviteUrl(): string {
                if (this.inviteId == null) return null;
                let path = window.location.protocol + "//" +
                    window.location.host + 
                    window.location.pathname;
                
                path += "#invite=" + this.inviteId;

                return path;
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