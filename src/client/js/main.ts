import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { SocketChangePacket, CreateRoomPacket, RequestRoomsPacket } from '../../shared/network/ClientPackets';
import Vue from 'vue';
import { ServerPacketType } from '../../shared/network/ServerPacket';




$.ready.then(() => {
    
    var app = new Vue({
        el: "#app",
        data: {
            roomList: []
        }
    });

    const socket = io('localhost:3001');

    let id = Cookies.get('previousId');
    if (id !== undefined && socket.id !== id) {
        socket.send(new SocketChangePacket(id));
    }
    
    socket.on("message", (data: ServerPacketType) => {
        try {
            switch (data.type) {
                case 'roomList':
                    app.$data.roomList = data.roomList
            }
        } catch(e) {
            console.warn('Error, malfunctioned packet', e);
        }
    });

    $("#refresh").click(() => {
        socket.send(new RequestRoomsPacket());
    });

    $("#createRoom").click(() => {
        socket.send(new CreateRoomPacket({
            allowedPlayers: 5
        }));
    });
})