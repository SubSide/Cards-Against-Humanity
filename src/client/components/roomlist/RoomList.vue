<template>
    <div class="row">
        <create-room />
        <div class="col-12 p-3">
            <button class="btn btn-primary" data-toggle="modal" data-target="#createRoomDialog">Create room</button>
            <button class="btn btn-secondary" @click="requestRooms">Refresh</button>
        </div>

        <div class="col-lg-4 col-sm-6" v-for="room in rooms" :key="room.id">
            <room :room="room"></room>
        </div>

        <div class="col alert alert-primary text-center" v-if="rooms.length < 1" role="alert">
            No servers created yet! Click <button class="btn btn-sm btn-outline-dark">here</button> to create your own.
        </div>
    </div>
</template>

<script>
    import Room from './Room.vue';
    import CreateRoom from './CreateRoom.vue';
    import { RequestRoomsPacket, CreateRoomPacket } from '../../../shared/network/ClientPackets';
    
    module.exports = {
        name: 'room-list',
        data() {
            return {
                rooms: []
            }
        },
        sockets: {
            roomList: function(data) {
                this.rooms = data.roomList;
            }
        },
        mounted: function() {
            this.requestRooms();
        },
        methods: {
            createRoom() {
                this.$socket.send(new CreateRoomPacket({maxPlayers: 8}));
            },
            requestRooms() {
                this.$socket.send(new RequestRoomsPacket());
            }
        },
        components: { 'room': Room, 'create-room': CreateRoom }
    }
</script>