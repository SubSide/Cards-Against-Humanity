
<template>
    <div class="modal fade" id="settingsDialog" tabindex="-1" role="dialog" aria-labelledby="settingsLabel" aria-hidden="true">
        <div id="loginForm" class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="settingsLabel">Settings</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group mt-3">
                        <label for="cardSize">Card text size:</label>
                        <input 
                            type="range" 
                            class="form-control" 
                            id="cardSize"
                            min="0"
                            max="11"
                            v-model.number="cardSize">
                    </div>
                    <div class="form-check mt-3">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="inlineCards"
                            v-model="inlineCards">
                        <label class="form-check-label" for="inlineCards">Inline card text for easier reading</label>
                    </div>
                    <div class="form-check mt-3">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="hideLogo"
                            v-model="hideLogo">
                        <label class="form-check-label" for="hideLogo">Hide card logo</label>
                    </div>
                    <div class="form-check mt-3">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="lightThemeSetting"
                            v-model="lightTheme">
                        <label class="form-check-label" for="lightThemeSetting">Use light theme (Don't be that guy.)</label>
                    </div>
                    <div class="form-group mt-3">
                        <span>When should we play sounds?</span>
                        <select class="form-control" v-model="playSound" id="playSound">
                            <option value="none" selected>Don't play any sounds</option>
                            <option value="relevant">Only play sounds relevant for me</option>
                            <option value="always">Play all sounds</option>
                        </select>
                        <select class="form-control" v-model="soundBackgroundType" id="soundBackgroundType">
                            <option value="background" selected>Only completely in the background</option>
                            <option value="outOfFocus">When window is out of focus</option>
                            <option value="always">Always</option>
                        </select>

                        <label for="soundVolume">Sound volume:</label>
                        <input 
                            type="range" 
                            class="form-control" 
                            id="soundVolume"
                            min="0"
                            max="1"
                            step="0.01"
                            @change="testSound"
                            v-model.number="soundVolume">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import ding from '../../assets/sounds/ding.wav';

    export default Vue.extend({
        name: 'settings',
        data: function() {
            return {
                sound: new Audio(ding),
            }
        },
        methods: {
            testSound() {
                console.debug("Test sound!");
                this.sound.currentTime = 0;
                this.sound.play();
            }
        },
        computed: {
            cardSize: {
                get() {
                    return this.$store.state.settings.cardSize;
                },
                set(value) {
                    this.$store.commit('updateCardSize', value);
                }
            },
            inlineCards: {
                get() {
                    return this.$store.state.settings.inlineCards;
                },
                set(value) {
                    this.$store.commit('updateInlineCards', value);
                }
            },
            lightTheme: {
                get() {
                    return this.$store.state.settings.lightTheme;
                },
                set(value) {
                    this.$store.commit('updateLightTheme', value);
                }
            },
            hideLogo: {
                get() {
                    return this.$store.state.settings.hideLogo;
                },
                set(value) {
                    this.$store.commit('updateHideLogo', value);
                }
            },
            playSound: {
                get() {
                    return this.$store.state.settings.playSound;
                },
                set(value) {
                    this.$store.commit('updatePlaySound', value);
                }
            },
            soundBackgroundType: {
                get() {
                    return this.$store.state.settings.soundBackgroundType;
                },
                set(value) {
                    this.$store.commit('updateSoundBackgroundType', value);
                }
            },
            soundVolume: {
                get() {
                    return this.$store.state.settings.soundVolume;
                },
                set(value) {
                    this.sound.volume = parseFloat(value as string);
                    this.$store.commit('updateSoundVolume', value);
                }
            }
        }
    });
</script>