import { v4 as UUID } from 'uuid';
import { Db } from "mongodb";
import { CardManager } from './CardManager';
import { ServerRoom } from '../models/ServerRoom';
import { BlackCard, WhiteCard } from '../../shared/models/Card';
import { Settings } from '../../shared/models/Settings';
import { ServerUser } from '../models/ServerUser';
import { ServerPlayer } from '../models/ServerPlayer';
import ClientError from '../util/ClientError';

export class RoomManager {
    private cardManager: CardManager;
    public rooms: ServerRoom[] = [];

    public constructor(db: Db) {
        this.cardManager = new CardManager(db);
    }
    
    public createRoom(owner: ServerUser, settings: Settings): ServerRoom {
        if (owner.player != null) {
            throw new ClientError("You can't create a new room as you're already in a room!");
        }
        
        let room = new ServerRoom(
            UUID(),
            "Room " + (Math.floor(Math.random() * 899999) + 100000),
            this.cardManager.packs,
            settings
        )

        let ownerPlayer = room.join(owner);
        room.owner = ownerPlayer;

        this.rooms.push(room);

        console.info(`Room #${room.id} created by: ${owner.username}`);

        return room;
    }
};