import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import MongoDb, { Db } from "mongodb";
import { GameManager } from './GameManager';
import { ClientPacketType } from '../shared/network/ClientPackets';
require('dotenv').config({ path: __dirname+'/../.env' });

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB = process.env.MONGODB_DB;
const WEB_PORT = process.env.WEB_PORT;
const SERVER_PORT = process.env.SERVER_PORT;

var server: http.Server;

const app = express();
app.use(express.static(__dirname+'/../client'));
const webServer = app.listen(WEB_PORT, () => console.debug(`App listening at http://localhost:${WEB_PORT}`));


MongoDb.MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true })
    .then(client => client.db(MONGODB_DB))
    .then(db => {
        return new Promise((resolve, reject) => {
            db.createCollection("packs").then(
                () => resolve(db),
                err => reject(err)
            );
        });
    })
    .then(db => {
        server = http.createServer(app);
        const io = socketIO(server);
        const gameManager = new GameManager(db as Db, io);

        io.on('connection', client => {
            gameManager.onConnect(client);
            
            client.on('message', data => {
                gameManager.onPacket(client, data as ClientPacketType);
             });

            client.on('disconnect', () => { 
                gameManager.onDisconnect(client);
             });
        });
        
        server.listen(SERVER_PORT);

    });

    
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown)

function shutDown() {
    console.warn("!!! SERVER CLOSED !!!");
    webServer.close(err => {
        server?.close(err2 => {
            if (err || err2) {
                process.exit();
            } else {
                process.exit(1);
            }
        });
    });
}