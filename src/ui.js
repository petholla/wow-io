import { get_seasons, setDebugMode, logMessage } from "./common.js";
import { myCharacters, addCharacter, reloadAllCharacters } from "./wow-io.js";
import { RealmManager, sortRealms } from "./realms.js";

export function bigPopUp(id) {
    const popUpDiv = document.createElement("div");

    if (id) {
        popUpDiv.id = id;
    }
    else {
        popUpDiv.id = "popUpDiv";
    }

    popUpDiv.className = "popup";
    document.body.appendChild(popUpDiv);
    const footNote = document.createElement("p");
    footNote.innerText = "Press ESC to close.";
    footNote.style.position = "absolute";
    footNote.style.fontSize = "small";
    footNote.style.bottom = "0";
    footNote.style.right = "10";
    popUpDiv.appendChild(footNote);

    return popUpDiv;
}

export function reloadRealmSelector() {
    const realmSelector = document.getElementById("inputRealm");
    realmSelector.innerHTML = "";
    
    const realmManager = new RealmManager();
    const realms = realmManager.getRealms();

    const addButton = document.getElementById("addCharacterButton");
    const addInput = document.getElementById("inputCharacter");

    if (realms.length == 0) {
        const option = document.createElement("option");
        option.innerText = "Add realms by clicking the 'Realms' header above.";
        option.disabled = true;
        option.selected = true;
        realmSelector.appendChild(option);

        addButton.disabled = true;
        addInput.disabled = true;
    }
    else {
        addButton.disabled = false;
        addInput.disabled = false;

        for (const realm of realms.toSorted(sortRealms)) {
            const option = document.createElement("option");
            const realmName = `(${realm.region}) ${realm.realm}`;
            if (realm == "Fizzcrank") {
                option.selected = true;
            }
            option.region = realm.region;
            option.realm = realm.realm;
            option.innerText = realmName;
            realmSelector.appendChild(option);
        }
    }
}


export function addNewCharacterForm(eventFunction) {
    // add character form
    const inputTable = document.createElement("table");
    inputTable.id = "addCharacterTable";
    const formRow = document.createElement("tr");
    const headers = ["Realm", "Character", ""];
    for (const header of headers) {
        const th = document.createElement("th");
        if (header == "Realm") {
            th.id = "realmHeader";
            th.title = "Click to edit realm list.";

            const realmManager = new RealmManager();

            th.addEventListener("click", function() {
                realmManager.editRealms();
            });
        }
        th.className = "rounded";
        th.innerText = header;
        formRow.appendChild(th);
    }

    inputTable.appendChild(formRow);
    const formDiv = document.getElementById("addCharacterDiv");
    formDiv.appendChild(inputTable);

    const inputRow = document.createElement("tr");
    inputTable.appendChild(inputRow);
    const realmCell = document.createElement("td");
    inputRow.appendChild(realmCell);

    // realm selector
    const realmInput = document.createElement("select");
    realmCell.appendChild(realmInput);
    realmInput.id = "inputRealm";

    // Character name input
    const characterInput = document.createElement("input");
    characterInput.id = "inputCharacter";
    characterInput.type = "text";
    characterInput.placeholder = "Name";
    characterInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            eventFunction(event);
        }
    });
    const nameCell = document.createElement("td");
    inputRow.appendChild(nameCell);
    nameCell.appendChild(characterInput);

    const submitCell = document.createElement("td");
    inputRow.appendChild(submitCell);

    const submitButton = document.createElement("button");
    submitCell.appendChild(submitButton);
    submitButton.id = "addCharacterButton";
    submitButton.type = "submit";
    submitButton.innerText = "Add Character";
    submitButton.addEventListener("click", eventFunction);

    // we reload here to we can disable stuff if no realms are available
    reloadRealmSelector();
}

// Add 'Notes' section
export function addNotesSection() {
    const notes = document.getElementById("NotesDiv");
    const notesTable = document.createElement("table");
    notesTable.id = "notesTable";
    notes.appendChild(notesTable);
    const headerRow = document.createElement("tr");
    notesTable.appendChild(headerRow);
    const notesHeader = document.createElement("th");
    notesHeader.className = "rounded";
    notesHeader.innerText = "Notes";
    headerRow.appendChild(notesHeader);

    const notesRow = document.createElement("tr");
    notesTable.appendChild(notesRow);

    const notesCell = document.createElement("td");
    notesRow.appendChild(notesCell);
    notesCell.innerHTML = "<li>This is a simple web app to track m+ IO scores (from raider.io) for different characters (yours, friends, etc). All data stored locally in the browser.</li>";
    notesCell.innerHTML += "<li>To get started, click on the Realm header in the top left corner to add realms you have toons to track on, then you can start adding characters.</li>";
    notesCell.innerHTML += "<li>You can click on a character name to highlight it (e.g. your alts). Click again to unhighlight.</li>";
    notesCell.innerHTML += "<li>You can share characters with friends or just between different browsers by exporting then importing the list (bottom right buttons).</li>";
    notesCell.innerHTML += "<li>Key levels are highlighted in yellow at 10 or above (portals).</li>";
    notesCell.innerHTML += "<li>Please send feedback to <b><i>wow-io@petholla.com</i></b>.</li>";
}

// Add season selector
export async function addSeasonSelector() {
    const seasonDiv = document.getElementById("seasonDiv");
    const seasonTable = document.createElement("table");
    seasonTable.style.textAlign = "center";
    seasonDiv.appendChild(seasonTable);
    const headerRow = document.createElement("tr");
    seasonTable.appendChild(headerRow);
    const seasonHeader = document.createElement("th");
    seasonHeader.className = "rounded";
    seasonHeader.innerText = "Season";
    headerRow.appendChild(seasonHeader);

    const seasonRow = document.createElement("tr");
    seasonTable.appendChild(seasonRow);
    const seasonCell = document.createElement("td");
    seasonRow.appendChild(seasonCell);

    const seasons = await get_seasons();

    const dungeon_map = new Map();

    function compare_dates(a, b) {
        const date1 = Date.parse(a.starts.us);
        const date2 = Date.parse(b.starts.us);
        return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    }

    for (const season of seasons.toSorted(compare_dates)) {
        // ignore ptr/beta/btm seasons
        if (season.slug.includes("ptr") || season.slug.includes("beta") || season.slug.includes("break")) {
            continue;
        }
   
        let dungeonShostnames = []
        for (const dungeon of season.dungeons.toSorted()) {
            dungeonShostnames.push(dungeon.short_name);
        }
        dungeon_map.set(season.slug, dungeonShostnames);

        localStorage.setItem("currentSeason", season.slug);
        localStorage.setItem("dungeons", JSON.stringify(dungeon_map.get(season.slug)));
        seasonCell.innerHTML = season.name;
        break;
    }
}

// Add 'Admin' section
export function addAdminSection() {
    const adminDiv = document.getElementById("AdminDiv");
    const adminTable = document.createElement("table");
    adminDiv.appendChild(adminTable);
    const headerRow = document.createElement("tr");
    adminTable.appendChild(headerRow);
    const adminHeaderNames = ["Debug", "Export", "Import"];
    for (const header of adminHeaderNames) {
        const adminHeader = document.createElement("th");
        adminHeader.innerText = header;
        adminHeader.className = "rounded";
        headerRow.appendChild(adminHeader);
    }
    const adminRow = document.createElement("tr");
    adminTable.appendChild(adminRow);
    const debugCell = document.createElement("td");
    adminRow.appendChild(debugCell);
    const debugCheckbox = document.createElement("input");
    debugCheckbox.type = "checkbox";
    debugCheckbox.id = "debugCheckbox";

    // check if debug mode is enabled in local storage
    const localStorageDebugMode = (localStorage.getItem("debugMode") === "true");
    if (localStorageDebugMode) {
        debugCheckbox.checked = localStorageDebugMode;
        setDebugMode(localStorageDebugMode);
    }
    debugCell.appendChild(debugCheckbox);
    debugCell.title = "Check for sending debug info to console.";

    debugCheckbox.addEventListener("change", function(event) {
        setDebugMode(event.target.checked);
    });

    // Export button
    const exportCell = document.createElement("td");
    const exportButton = document.createElement("button");
    exportCell.appendChild(exportButton);
    exportButton.innerText = "Export";
    exportButton.id = "exportButton";
    adminRow.appendChild(exportCell);

    exportButton.addEventListener("click", function() {
        const characterList = [];
        for (const character of myCharacters) {
            characterList.push({
                realm: character.realm,
                name: character.name,
            })
        }
        const data = btoa(JSON.stringify(characterList));
        navigator.clipboard.writeText(data);
        window.alert("Character list copied to clipboard.");
    });

    // catch escape if floaing windows are up
    document.onkeydown = function(event) {
        if ( event.key != "Escape" ) {
            return;
        }

        const popUp = document.getElementById("popUpDiv");
        if (popUp) {
            popUp.remove();
        }
    }

    // Import button
    const importCell = document.createElement("td");
    importCell.style.textAlign = "center";
    const importButton = document.createElement("button");
    importCell.appendChild(importButton);
    importButton.innerText = "Import";
    importButton.id = "importButton";
    adminRow.appendChild(importCell);

    importButton.addEventListener("click", function(event) {
        if (document.getElementById("popUpDiv")) {
            return;
        }
        
        const popUpDiv = bigPopUp("popUpDiv");
        const textArea = document.createElement("textarea");
        textArea.className = "importTextArea";
        textArea.id = "importTextArea";
        textArea.placeholder = "Paste exported data here.";
        popUpDiv.appendChild(textArea);
        const closeButton = document.createElement("button");
        closeButton.id = "importCloseButton";
        closeButton.className = "importCloseButton";
        closeButton.innerText = "Import";
        popUpDiv.appendChild(closeButton);
        closeButton.addEventListener("click", function() {
            event.preventDefault();
            event.stopPropagation();
            const data = document.getElementById("importTextArea").value;
            try {
                const characterList = JSON.parse(atob(data));
            }
            catch (error) {
                window.alert("Invalid data.");
                return;
            }
            const characterList = JSON.parse(atob(data));
            for (const character of characterList) {
                let region = "us"
                if (character.region) {
                    region = character.region
                }
                logMessage(`Adding ${region}-${character.realm}-${character.name}`);
                addCharacter(region, character.realm, character.name);
            }
            popUpDiv.remove();
        });
        textArea.focus();
    });
}
