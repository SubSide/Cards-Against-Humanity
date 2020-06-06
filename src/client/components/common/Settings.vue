
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
                        <label for="range">Card text size:</label>
                        <input 
                            type="range" 
                            class="form-control" 
                            id="range"
                            min="1"
                            max="10"
                            v-model.number="cardSize">
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
            }
        }
    });
</script>