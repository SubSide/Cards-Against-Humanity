import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import MongoDb, { Db } from "mongodb";
import { GameManager } from './GameManager';
require('dotenv').config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB = process.env.MONGODB_DB;
const WEB_PORT = process.env.WEB_PORT;
const SERVER_PORT = process.env.SERVER_PORT;


const app = express();
app.use(express.static('../client'));
app.listen(WEB_PORT, () => console.debug(`App listening at http://localhost:${WEB_PORT}`));


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
        const server = http.createServer(app);
        const io = socketIO(server);
        const gameManager = new GameManager(db as Db);

        io.on('connection', client => {
            gameManager.onConnect(client);
            client.on('event', data => { 

             });
            client.on('disconnect', () => { /* … */ });
        });
        
        server.listen(SERVER_PORT);

        var count = 1;
        setInterval(function () {
            io.emit("message", "Test: "+(count++));
        }, 2000);
    })