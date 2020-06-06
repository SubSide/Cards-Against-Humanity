
<template>
    <div class="modal fade" id="changeUsernameDialog" tabindex="-1" role="dialog" aria-labelledby="changeUsernameLabel" aria-hidden="true">
        <form id="loginForm" class="modal-dialog" v-on:submit.prevent="onLogin">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="changeUsernameLabel">Change Username</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input 
                            type="username" 
                            class="form-control" 
                            id="username"
                            pattern="[a-zA-Z0-9]{4,24}"
                            title="Username must be between 4 and 24 characters long"
                            v-model.trim.lazy="username"
                            required>
                    </div>
                    <div class="form-group">
                        <label for="identification">Identification code (optional):</label>
                        <input 
                            type="password" 
                            class="form-control" 
                            id="identification"
                            v-model.lazy="identification"
                            max="100"
                            title="Can have a maximum of 100 characters">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <input type="submit" class="btn btn-primary" value="Change Username">
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { ChangeNicknamePacket } from '../../../common/network/ClientPackets';

    export default Vue.extend({
        name: 'login',
        data() {
            return {
                username: "",
                identification: ""
            }
        },
        methods: {
            onLogin: function() {
                if (!($("#loginForm").get(0) as any).reportValidity()) {
                    return;
                }

                $("#changeUsernameDialog").modal('hide');
                this.$socket.send(new ChangeNicknamePacket(
                    this.username,
                    this.identification
                ));
                
                this.username = "";
                this.identification = "";
            }
        }
    });
</script>