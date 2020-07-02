const { exit } = require('yargs');

let DrawingDeck = require('../dist/server/util/DrawingDeck.js').default;

// Create an array of 10 items (0 till 9)
let items= Array.from(Array(10).keys());
let iterations = 25;

let testDeck = new DrawingDeck(items);

for (var i = 0; i < iterations; i++) {
    let drawn = [];

    for (var x = 0; x < items.length; x++) {
        let draw = testDeck.draw(true);
        if (drawn.indexOf(draw) >= 0) {
            console.debug(drawn, draw);
            console.error("Item was already drawn!");
            exit(1);
        }
        drawn.push(draw);
    }
}


for (var i = 0; i < iterations; i++) {
    let drawn = [];

    for (var x = 0; x < items.length; x++) {
        let draw = testDeck.draw();
        if (drawn.indexOf(draw) >= 0) {
            console.debug(drawn, draw);
            console.error("Item was already drawn!");
            exit(1);
        }
        testDeck.addToDiscard(draw);
        drawn.push(draw);
    }
}




console.debug("Deck test completed!");