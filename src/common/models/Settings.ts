import { PromptCard, ResponseCard } from "./Card";

export interface Settings {
    name?: string;
    maxPlayers?: number;
    pointsToWin?: number;
    timeToRespond?: number;
    packsIds?: string[];
    customPromptCards?: PromptCard[];
    customResponseCards?: ResponseCard[];
}

export function validatedSettings(settings: Settings): Settings {

    // -- Name check --
    let name = settings.name || "Room " + (Math.floor(Math.random() * 899999) + 100000);
    name = name.trim();
    // Should only contain letters, numbers and spaces
    if (name.length < 3 || name.length > 24 || !name.match("^[a-zA-Z0-9 ]+$")) {
        return null;
    }
    // -- End name check

    // -- maxPlayers check --
    let maxPlayers = settings.maxPlayers || 8;
    // Must be an integer between 3 and 16
    if (!Number.isInteger(maxPlayers) || maxPlayers < 3 || maxPlayers > 16) {
        return null;
    }
    // -- End maxPlayers check

    // Return validated settings
    return {
        name: name,
        maxPlayers: maxPlayers
    }
}