import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { SocketChangePacket, CreateRoomPacket } from '../../shared/network/ClientPackets';

$.ready.then(() => {
    const socket = io('localhost:3001');

    let id = Cookies.get('previousId');
    if (id !== undefined && socket.id !== id) {
        socket.send(new SocketChangePacket(id));
    }
    
    socket.on("message", (data: any) => {
        console.debug(data);
    });

    $("#refresh").click(() => {

    });

    $("#createRoom").click(() => {
        socket.send(new CreateRoomPacket({
            allowedPlayers: 5
        }));
    });
})