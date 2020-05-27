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
    socket.on('connect', () => {
        let id = Cookies.get('previousId');
        Cookies.set('previousId', socket.id, { sameSite: 'Strict' });
        if (id != undefined && id != "undefined" && socket.id !== id) {
            socket.send(new SocketChangePacket(id));
        }

    });
    
    socket.on("message", (data: ServerPacketType) => {
        // TODO just for testing
        console.debug(data);
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
            maxPayers: 5
        }));
    });
})