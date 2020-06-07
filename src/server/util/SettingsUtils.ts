import CardRetriever from "../db/CardRetriever";
import Settings from "../../common/models/Settings";

export function getDefaultSettings(): Settings {
    return {
        maxPlayers: 10,
        pointsToWin: 6,
        timeToRespond: 0,
        packIds: []
    }
}


export function validatedSettings(cardRetriever: CardRetriever, settings: Settings): Settings {
    // -- maxPlayers check --
    let maxPlayers = settings.maxPlayers;
    // Must be an integer between 3 and 24
    if (!Number.isInteger(maxPlayers) || maxPlayers < 3 || maxPlayers > 24) {
        return null;
    }
    // -- End maxPlayers check --

    // -- pointsToWin check --
    let pointsToWin = settings.pointsToWin;
    // Let's put a limit from 5 to 50 for now
    if (!Number.isInteger(pointsToWin) || pointsToWin < 5 || pointsToWin > 50) {
        return null;
    }
    // -- End pointsToWin check --

    // -- timeToRespond check --
    let timeToRespond = settings.timeToRespond;
    // They are intervals of 30 seconds. So Let's put it on a limit of 5 minutes, where 0 is unlimited
    if (!Number.isInteger(timeToRespond) || timeToRespond < 0 || timeToRespond > 10) {
        return null;
    }

    // -- packIds check --
    let packIds = settings.packIds;
    if (!Array.isArray(packIds) || packIds.length < 1 || packIds.length > 100) {
        return null;
    }

    // Remove the duplicates 
    let packsSet = new Set(...packIds);

    var promptCards = 0;
    var responseCards = 0;
    
    packsSet.forEach(packId => {
        let pack = cardRetriever.findPack(packId);

        // If there doesn't exist such a pack, the settings is not valid.
        if (pack == null) return null;

        promptCards += pack.promptCount;
        responseCards += pack.responseCount;
    });

    // Here we do some nice checking, make sure that the amount of prompt cards
    // is not less than like 2x the prompt cards.
    // And responseCards is not less like 5x the max players.
    if (promptCards < maxPlayers * 2 || responseCards < maxPlayers * 5) {
        return null;
    }

    // Return validated settings
    return {
        maxPlayers: maxPlayers,
        pointsToWin: pointsToWin,
        timeToRespond: timeToRespond,
        packIds: Array.from(packsSet)
    }
}