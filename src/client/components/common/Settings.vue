
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
                    <div class="form-group">
                        <label for="cardSize">Card text size:</label>
                        <input 
                            type="range" 
                            class="form-control" 
                            id="cardSize"
                            min="0"
                            max="10"
                            v-model.number="cardSize">
                    </div>
                    <div class="form-check">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="inlineCards"
                            v-model="inlineCards">
                        <label class="form-check-label" for="inlineCards">Inline card text for easier reading</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="hideLogo"
                            v-model="hideLogo">
                        <label class="form-check-label" for="hideLogo">Hide card logo</label>
                    </div>
                    <div class="form-check">
                        <input 
                            type="checkbox" 
                            class="form-check-input" 
                            id="lightThemeSetting"
                            v-model="lightTheme">
                        <label class="form-check-label" for="lightThemeSetting">Use light theme (Don't be that guy.)</label>
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

    export default Vue.extend({
        name: 'settings',
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
            }
        }
    });
</script>