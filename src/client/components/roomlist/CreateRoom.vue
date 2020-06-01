<template>
    <div class="modal fade" id="createRoomDialog" tabindex="-1" role="dialog" aria-labelledby="createRoomModalLabel" aria-hidden="true">
        <form class="modal-dialog" v-on:submit.prevent="onSubmit">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createRoomModalLabel">Create a new room</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="roomName">Room name:</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="roomName" 
                            v-model.trim.lazy="roomName"
                            pattern="[a-zA-Z0-9 ]{3,24}"
                            name="roomName" 
                            title="Can only contain letters, spaces and numbers. Must be between 3 and 24 characters long.">
                    </div>
                    <div class="form-group">
                        <label for="maxPlayers">Max number of players:</label>
                        <input 
                            type="number" 
                            class="form-control" 
                            id="maxPlayers"
                            v-model.number.lazy="maxPlayers"
                            name="maxPlayers" 
                            min="3" max="16"
                            title="Must be a number between 3 and 16">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <input type="submit" class="btn btn-primary" value="Create Room">
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { CreateRoomPacket } from '../../../common/network/ClientPackets';

    export default Vue.extend({
        name: 'createRoom',
        data() {
            return {
                roomName: "",
                maxPlayers: 0
            }
        },
        methods: {
            onSubmit: function() {
                $("#createRoomDialog").modal('hide');
                this.$socket.send(new CreateRoomPacket({
                    name: this.roomName,
                    maxPlayers: this.maxPlayers
                }));
            }
        }
    });
</script>