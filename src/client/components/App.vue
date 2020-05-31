<template>
    <div class="container">
        <room-list />
    </div>
</template>

<script>
    import sessionStorage from 'sessionstorage';
    import { SocketChangePacket, RequestStateUpdatePacket } from '../../common/network/ClientPackets';
    import RoomList from './roomlist/RoomList.vue';

    const STORAGE_PREVIOUS_ID = 'STORAGE_PREVIOUS_ID';

    export default {
        components: { 'room-list': RoomList },
        sockets: {
            connect: function() {
                let id = sessionStorage.getItem(STORAGE_PREVIOUS_ID);
                sessionStorage.setItem(STORAGE_PREVIOUS_ID, this.$socket.id, { sameSite: 'Strict' });
                if (id != undefined && id != "undefined" && this.$socket.id !== id) {
                    this.$socket.send(new SocketChangePacket(id));
                }
            },
            errorPacket: function(packet) {}
        }
    }
</script>