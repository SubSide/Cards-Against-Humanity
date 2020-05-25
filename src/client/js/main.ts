// const socketio = require('./lib/socket.io.min.js');
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { SocketChangePacket } from '../../shared/network/Packets';

const socket = io('localhost:3001');

let id = Cookies.get('previousId');
if (id !== undefined && socket.id !== id) {
    socket.send(new SocketChangePacket(id));
}

socket.on("message", (msg: string) => {
    document.write(msg);
});

