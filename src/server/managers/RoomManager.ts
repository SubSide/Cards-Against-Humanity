import { v4 as UUID } from 'uuid';
import { Db } from "mongodb";
import { CardManager } from './CardManager';
import { ServerRoom } from '../models/ServerRoom';
import { BlackCard, WhiteCard } from '../../common/models/Card';
import { Settings, validatedSettings } from '../../common/models/Settings';
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

        let validated = validatedSettings(settings);
        if (validated == null) {
            throw new ClientError("Invalid settings received.");
        }
        
        
        let room = new ServerRoom(
            UUID(),
            this.cardManager.packs,
            validated
        );

        let ownerPlayer = room.join(owner);
        room.owner = ownerPlayer;

        this.rooms.push(room);

        console.info(`Room #${room.id} created by: ${owner.username}`);

        return room;
    }

    public getRoom(id: string): ServerRoom {
        return this.rooms.find(room => room.id == id);
    }
};