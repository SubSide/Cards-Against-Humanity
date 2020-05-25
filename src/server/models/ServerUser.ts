import { User } from "../../shared/models/User";
import { ServerPlayer } from './ServerPlayer';

export class ServerUser implements User, Transmissible {
    public lastActive: number;
    public player?: ServerPlayer;

    constructor(
        public id: string,
        public username: string = 'anon_' + (Math.random() * 899999999 + 100000000)
    ){
        this.lastActive = 0;
    }

    getTransmitData(): User {
        return {
            username: this.username
        }
    }
}