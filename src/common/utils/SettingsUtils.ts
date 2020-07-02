import Settings from "../models/Settings";

export function hasSettingsChanged(oldSettings: Settings, newSettings: Settings): boolean {
    if (oldSettings != newSettings && (oldSettings == null || newSettings == null)) return true;

    checkChanges: {
        if (newSettings.maxPlayers != oldSettings.maxPlayers) break checkChanges;
        if (newSettings.pointsToWin != oldSettings.pointsToWin) break checkChanges;
        if (!areArraysTheSame(newSettings.packIds, oldSettings.packIds)) break checkChanges;

        // If we came to this point it means there are no changes, so we return false
        return false;
    }

    // If we broke out of checkChanges that means that something changed, so we return true
    return true;
}

export function areArraysTheSame(array1: string[], array2: string[]): boolean {
    // If there are changes in length they are different
    if (array1.length != array2.length) return false;

    // If not all entries in array1 is found in array2 we know something's different
    if (!array1.every(entry => array2.indexOf(entry) >= 0)) {
        // If there are changes we return false
        return false;
    }

    // Otherwise they're the same
    return true;
}