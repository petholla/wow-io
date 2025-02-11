import { setDebugMode } from "./common.js";
import { myCharacters, addCharacter } from "./wow-io.js";

export function addNewCharacterForm(eventFunction) {
    // add character form
    const inputTable = document.createElement("table");
    inputTable.id = "addCharacterTable";
    inputTable.style.width = "50%";
    const formRow = document.createElement("tr");
    const headers = ["Realm", "Character", ""];
    for (const header of headers) {
        const th = document.createElement("th");
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
    const realmInput = document.createElement("select");
    realmCell.appendChild(realmInput);
    realmInput.id = "inputRealm";

    const realms = ["Fizzcrank", "Aggramar", "Gorefiend"];
    for (const realm of realms) {
        const option = document.createElement("option");
        if (realm == "Fizzcrank") {
            option.selected = true;
        }
        option.value = realm;
        option.innerText = realm;
        realmInput.appendChild(option);
    }

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

/*    const lineBreak = document.createElement("br");  
    formDiv.appendChild(lineBreak);*/
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
    notesCell.innerHTML = "<li>You can click on a character name to highlight it (e.g. your alts). Click again to unhighlight.</li>";
    notesCell.innerHTML += "<li>Key levels are highlighted in yellow at 10 or above (portals).</li>";
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
    debugCell.style.textAlign = "center";
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
    exportCell.style.textAlign = "center";
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

    // Import button
    const importCell = document.createElement("td");
    importCell.style.textAlign = "center";
    const importButton = document.createElement("button");
    importCell.appendChild(importButton);
    importButton.innerText = "Import";
    importButton.id = "importButton";
    adminRow.appendChild(importCell);
    importButton.addEventListener("click", function() {
        const data = prompt("Paste the exported data here.");
        const characterList = JSON.parse(atob(data));
        for (const character of characterList) {
            addCharacter(character.realm, character.name);
        }
    });
}
