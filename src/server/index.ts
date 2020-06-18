import socketIO from 'socket.io';
import MongoDb, { Db } from "mongodb";
import GameManager from './GameManager';
import { ClientPacketType } from '../common/network/ClientPackets';
try {
    require('dotenv').config({ path: __dirname+'/../../.env' });
} catch(e) {
    require('dotenv').config({ path: __dirname+'/../.env' });
}

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB = process.env.MONGODB_DB;
const WEB_PORT = process.env.WEB_PORT;
const SERVER_PORT = process.env.SERVER_PORT;
const DEBUG = process.env.DEBUG;

// var server: http.Server;
var ioServer: socketIO.Server;

async function createCollections(db: Db) {
    let awaits: Promise<any>[] = [];
    awaits.push(db.createCollection("packGroups"));
    awaits.push(db.createCollection("hashes"));
    awaits.push(db.createCollection("bans").then(collection => {
        collection.createIndex("type")
    }))


    await Promise.all(awaits);
}

MongoDb.MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true })
    .then(client => client.db(MONGODB_DB))
    .then(db => {
        return new Promise((resolve, reject) => {
            createCollections(db).then(() => resolve(db));
        });
    })
    .then(db => {
        ioServer = socketIO();
        const gameManager = new GameManager(db as Db, ioServer);

        ioServer.on('connection', client => {
            gameManager.onConnect(client);
            
            client.on('message', data => {
                if (DEBUG) {
                    if ((data as ClientPacketType).type != 'changeNickname' && process.env.DEBUG)
                        console.debug("Packet received:", data);
                }
                gameManager.onPacket(client, data as ClientPacketType);
             });

            client.on('disconnect', () => { 
                gameManager.onDisconnect(client);
             });
        });
        
        ioServer.listen(SERVER_PORT);

    });

    
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown)

function shutDown() {
    console.warn("!!! SERVER CLOSED !!!");
    ioServer?.close(() => {
        process.exit();
    });
}