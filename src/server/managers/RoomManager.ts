import { v4 as UUID } from 'uuid';
import { Db } from "mongodb";
import { CardManager } from './CardManager';
import { ServerRoom } from '../models/ServerRoom';
import { BlackCard, WhiteCard } from '../../shared/models/Card';
import { Settings } from '../../shared/models/Settings';
import { ServerUser } from '../models/ServerUser';
import { ServerPlayer } from '../models/ServerPlayer';

export class RoomManager {
    private cardManager: CardManager;
    public rooms: ServerRoom[] = [];

    public constructor(db: Db) {
        this.cardManager = new CardManager(db);
    }
    
    public createGame(owner: ServerUser, settings: Settings): ServerRoom {
        let room = new ServerRoom(
            UUID(),
            this.cardManager.packs,
            settings
        )

        let ownerPlayer = new ServerPlayer(room, owner);
        ownerPlayer.user = owner;
        room.owner = ownerPlayer;

        this.rooms.push(room);

        return room;
    }
};