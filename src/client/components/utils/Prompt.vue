
<template>
    <div ref="modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div id="loginForm" class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">{{ title }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>{{ content }}</p>
                    <div v-if="input != null" class="form-group">
                        <input
                            :type="input"
                            class="form-control"
                            v-model="data" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" @click="confirm">Ok</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';

    export default Vue.extend({
        name: 'prompt',
        props: ["title", "content", "input", "onConfirm"],
        data: function() {
            return {
                data: ""
            }
        },
        methods: {
            confirm() {
                this.onConfirm(this.data);
            },
            show() {
                $(this.$refs.modal).modal('show');
            }
        }
    });
</script>