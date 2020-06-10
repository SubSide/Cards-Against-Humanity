import CardRetriever from "../db/CardRetriever";
import Settings from "../../common/models/Settings";
import ClientError from "./ClientError";

export function getDefaultSettings(): Settings {
    return {
        maxPlayers: 10,
        pointsToWin: 6,
        timeToRespond: 0,
        packIds: []
    }
}


export function validatedSettings(cardRetriever: CardRetriever, settings: Settings): Settings {
    let error = new ClientError("Settings were malformed.");
    
    // -- maxPlayers check --
    let maxPlayers = settings.maxPlayers;
    // Must be an integer between 3 and 24
    if (!Number.isInteger(maxPlayers) || maxPlayers < 3 || maxPlayers > 24) {
        console.log("Received a packet where maxPlayers was incorrect");
        throw error;
    }
    // -- End maxPlayers check --

    // -- pointsToWin check --
    let pointsToWin = settings.pointsToWin;
    // Let's put a limit from 5 to 50 for now
    if (!Number.isInteger(pointsToWin) || pointsToWin < 5 || pointsToWin > 50) {
        console.log("Received a packet where pointsToWin was incorrect");
        throw error;
    }
    // -- End pointsToWin check --

    // -- timeToRespond check --
    let timeToRespond = settings.timeToRespond;
    // They are intervals of 30 seconds. So Let's put it on a limit of 15 minutes, where 0 is unlimited
    if (!Number.isInteger(timeToRespond) || timeToRespond < 0 || timeToRespond > 30) {
        console.log("Received a packet where timeToRespond was incorrect");
        throw error;
    }
    // -- End timeToRespond check --

    // -- packIds check --
    let packIds = settings.packIds;
    if (!Array.isArray(packIds) || packIds.length > 100) {
        console.log("Received a packet where packIds was incorrect");
        throw error;
    }

    // Remove the duplicates 
    let packsSet = new Set(packIds);
    
    packsSet.forEach(packId => {
        let pack = cardRetriever.findPack(packId);

        // If there doesn't exist such a pack, the settings is not valid.
        if (pack == null) {
            console.debug("Tried to find a certain pack ID which returned null");
            throw error;
        }
    });
    // -- End packIds check --


    // Return validated settings
    return {
        maxPlayers: maxPlayers,
        pointsToWin: pointsToWin,
        timeToRespond: timeToRespond,
        packIds: Array.from(packsSet)
    }
}


export function areSettingsPleasant(cardRetriever: CardRetriever, settings: Settings) {
    let error = new ClientError("Settings were malformed.");

    // First we make sure we actually have correct settings
    validatedSettings(cardRetriever, settings);


    let packIds = settings.packIds;

    // Remove the duplicates 
    let packsSet = new Set(packIds);

    var promptCards = 0;
    var responseCards = 0;
    
    packsSet.forEach(packId => {
        let pack = cardRetriever.findPack(packId);

        // If there doesn't exist such a pack, the settings is not valid.
        if (pack == null) {
            console.debug("Tried to find a certain pack ID which returned null");
            throw error;
        }
        promptCards += pack.promptCount;
        responseCards += pack.responseCount;
    });

    // Here we do some nice checking, make sure that the amount of prompt cards
    // is not less than like 2x the prompt cards.
    // And responseCards is not less like 5x the max players.
    if (promptCards < settings.maxPlayers * 2 || responseCards < settings.maxPlayers * 5) {
        console.log("We don't have enough cards!");
        throw new ClientError("To make sure you have a pleasant experience, please pick more cards");
    }

    return;
}