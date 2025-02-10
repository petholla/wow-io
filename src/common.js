export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// debug logging

let debugMode = false;

export function setDebugMode(mode) {
    debugMode = mode;
    if (debugMode) {
        console.log("Debug mode enabled.");
    }
    else {
        console.log("Debug mode disabled.");
    }
    localStorage.setItem("debugMode", mode);
}

export function logMessage(message) {
    if (debugMode) {
        const now = new Date();
        console.log(`${now.toISOString()} [DEBUG] ${message}`);
    }
}