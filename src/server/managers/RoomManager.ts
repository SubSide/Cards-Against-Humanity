import { v4 as UUID } from 'uuid';
import { Db } from "mongodb";
import CardRetriever from '../db/CardRetriever';
import ServerRoom from '../models/ServerRoom';
import ServerUser from '../models/ServerUser';
import ClientError from '../util/ClientError';
import Pack from '../models/ServerPack';

export default class RoomManager {
    public cardRetriever: CardRetriever;
    public rooms: ServerRoom[] = [];

    public constructor(db: Db) {
        this.cardRetriever = new CardRetriever(db);
    }
    
    public createRoom(owner: ServerUser): ServerRoom {
        if (owner.player != null) {
            throw new ClientError("You can't create a new room as you're already in a room!");
        }
        
        let packs: Pack[] = [];
        this.cardRetriever.groups.forEach(group => {
            packs = packs.concat(group.packs)
        });
        
        let room = new ServerRoom(
            this,
            UUID(),
            owner
        );

        this.rooms.push(room);

        console.info(`Room #${room.id} created by: ${owner.username}`);

        return room;
    }

    public deleteRoom(room: ServerRoom) {
        // Remove all players from the room
        room.players.forEach(player => {
            room.leave(player);
        });

        // Remove the room from the list
        this.rooms.splice(this.rooms.indexOf(room), 1);
    }

    public getRoom(id: string): ServerRoom {
        return this.rooms.find(room => room.id == id);
    }
    
};