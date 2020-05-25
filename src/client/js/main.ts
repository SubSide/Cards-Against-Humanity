import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { SocketChangePacket, CreateRoomPacket, RequestRoomsPacket } from '../../shared/network/ClientPackets';
import Vue from 'vue';




$.ready.then(() => {
    
    var app = new Vue({
        el: "#app",
        data: {
            message: "Hi!"
        }
    });

    const socket = io('localhost:3001');

    let id = Cookies.get('previousId');
    if (id !== undefined && socket.id !== id) {
        socket.send(new SocketChangePacket(id));
    }
    
    socket.on("message", (data: any) => {
        console.debug(data);
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