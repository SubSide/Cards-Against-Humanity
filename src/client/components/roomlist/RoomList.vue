<template>
    <div class="row">
        <div class="col-12">
            <button @click="createRoom">Create room</button>
            <button @click="requestRooms">Refresh</button>
        </div>

        <room v-for="room in rooms" :key="room.id" :room="room"></room>

        <div class="col" v-if="rooms.length < 1">
            No servers created yet! Click <button>here</button> to create your own.
        </div>
    </div>
</template>

<script>
    import Room from './Room.vue';
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
        components: { 'room': Room }
    }
</script>