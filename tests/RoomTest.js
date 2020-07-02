const { MongoClient } = require("mongodb");
const { default: RoomManager } = require("./mocks/RoomManager.js");
const { exit } = require("yargs");
const CardRetriever = require('../dist/server/db/CardRetriever.js').default;
const Room = require('../dist/server/models/ServerRoom.js').default;
const User = require('./mocks/User.js').default;

var database;
var retriever;
var roomManager;
MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true })
    .then(client => client.db("cah"))
    .then(db => {
        database = db;
        retriever = new CardRetriever(db);
        return retriever.retrieveCards(db);
    })
    .then(() => {
        roomManager = new RoomManager(retriever);
        let owner = new User();
        var users = [owner];

        // Create a room
        let room = new Room(roomManager, 'test', owner);

        // Let random users join
        for (var i = 0; i < 5; i++) {
            let user = new User();
            users.push(user);
            room.join(user, null);
        }

        // Set room settings
        setSettings(room, owner);

        // Start room
        room.start(retriever);

        // Test for duplicate cards
        testForDuplicates(room);

        console.debug("Done!");
    })


function setSettings(room, owner) {
        // Create a list of pack Ids
        let packIds = [];
        var i = Math.floor(Math.random() * (retriever.packs.length - 5));
        let iterator = retriever.packs.entries();
        
        while (packIds.length < 5) {
            let entry = iterator.next().value;
            if (entry[1].name.indexOf('Main') >= 0) continue;

            packIds.push(entry[0]);
        }

        // Update room settings
        room.updateSettings(owner, {
            packIds: packIds,
            maxPlayers: 8,
            pointsToWin: 10,
        }, null);
}


function playRound() {

}



function testForDuplicates(room) {
    let cards = [];
    room.responses.deck.forEach(function(card) {
        if (cards.indexOf(card.text) >= 0) {
            console.error("Error! Found card twice!", card.text);
        } else {
            cards.push(card);
        }
    });
}