<template>
    <div class="row">
        <prompt ref="passwordPrompt" :title="'This room is password protected'" :input="'password'" :content="'Password:'" :onConfirm="joinRoomPassworded" />
        <div class="col-12 p-3">
            <button class="btn btn-primary" @click="createRoom">Create room</button>
            <button class="btn btn-secondary" @click="requestRooms">Refresh</button>
        </div>
        <div class="col-lg-4 col-sm-6" v-for="room in rooms" :key="room.id">
            <room :room="room"></room>
        </div>

        <div class="w-100 m-2 mt-4 alert alert-primary text-center" v-if="rooms.length < 1" role="alert">
            No rooms created yet! Click <button class="btn btn-sm btn-secondary" @click="createRoom">here</button> to create your own.
        </div>

        <div class="w-100 m-2 mt-4 alert alert-warning text-center" role="alert">
            This game is currently in beta. Things might break, cards might be incorrect, server might overload. If that happens please tell me about it. 
            Please take this in consideration when something goes wrong!
        </div>

        <div class="w-100 m-2 mt-4 alert alert-secondary text-center">
            This game was made by some random dude in his basement and is in no way affiliated with Cards Against Humanity
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Room from './Room.vue';
    import { RequestRoomsPacket, CreateRoomPacket, JoinRoomPacket } from '../../../common/network/ClientPackets';
    import { RoomListPacket } from '../../../common/network/ServerPackets';
    import { RoomListItem } from '../../../common/network/NetworkModels';
    
    export default Vue.extend({
        name: 'room-list',
        data() {
            return {
                rooms: [],
                joiningRoom: null
            }
        },
        sockets: {
            roomList: function(data: RoomListPacket) {
                this.$data.rooms = data.roomList;
            }
        },
        mounted: function() {
            this.requestRooms();
        },
        methods: {
            createRoom() {
                this.$socket.send(new CreateRoomPacket());
            },
            requestRooms() {
                this.$socket.send(new RequestRoomsPacket());
            },
            joinRoomPassworded(password: string) {
                this.joinRoom(this.joiningRoom, password);
            },
            joinRoom(room: RoomListItem, password: string = null) {
                this.joiningRoom = room;
                // TODO room password
                if (room.hasPassword && password == null) {
                    (this.$refs.passwordPrompt as any).show();
                    return;
                }
                
                this.$socket.send(new JoinRoomPacket(room.id, password));
            }
        },
        components: { 'room': Room }
    })
</script>