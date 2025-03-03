import Character from "./character.js";
import { addNewCharacterForm, addNotesSection, addAdminSection, addSeasonSelector } from "./ui.js";
import { refreshCounter } from "./refresh.js";
import { setDebugMode, logMessage, sleep, get_seasons } from "./common.js";

export let myCharacters = [];

addNewCharacterForm(addCharacterHandler);

await addSeasonSelector();

// load data from browser storage
loadData();

addNotesSection();

addAdminSection();

reloadAllCharacters();

let counter = new refreshCounter();
counter.start();

async function addCharacterHandler(event) {
    // prevent a reload
    event.preventDefault();

    const newCharacterRealm = document.getElementById("inputRealm");
    const newCharacterRegion = newCharacterRealm.options[newCharacterRealm.selectedIndex].region;
    const newCharacterRealmName = newCharacterRealm.options[newCharacterRealm.selectedIndex].realm;
    const newCharacterName = document.getElementById("inputCharacter").value;

    //
    const submitButton = document.getElementById("addCharacterButton");
    submitButton.disabled = true;
    await addCharacter(newCharacterRegion, newCharacterRealmName, newCharacterName);
    submitButton.disabled = false;
}

export async function addCharacter(region, realm, name, mine = false) {
    // capitalize character name
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    logMessage(`Adding character ${name} from realm ${realm}.`);

    // check if character already exists
    for (const character of myCharacters) {
        if (character.region == region && character.realm == realm && character.name == name) {
            window.alert(`${name} on ${region}-${realm} is already on the list!`);
            return;
        }
    }

    // add new character
    const newCharacter = new Character(region, realm, name);
    newCharacter.mine = mine;
    await newCharacter.fetchCharacter().then(response => {
        if (response) {
            myCharacters.push(newCharacter);
            saveData();
            refreshTable();
        }
    });
}

function saveData() {
    // save data to local storage
    localStorage.setItem("ioCharacters", JSON.stringify(myCharacters));
}

function loadData() {
    // reload data from local storage
    const data = localStorage.getItem("ioCharacters");
    if (data) {
        for (const character of JSON.parse(data)) {
            let region = "us";
            if (character.region) {
                region = character.region;
            }
            const newCharacter = new Character(region, character.realm, character.name);
            newCharacter.class = character.class;
            newCharacter.spec = character.spec;
            newCharacter.role = character.role;
            newCharacter.ilvl = character.ilvl;
            newCharacter.io = character.io;
            newCharacter.best_runs = character.best_runs;
            newCharacter.updated = new Date(character.updated);
            newCharacter.thumbnail = character.thumbnail;
            newCharacter.mine = character.mine;
            myCharacters.push(newCharacter);
        }
    }

    refreshTable();
}

function refreshTable() {
    // refresh table with characters
    const tableBody = document.getElementById("characterTableDiv");
    tableBody.innerHTML = "";
    const myTable = document.createElement("table");
    tableBody.appendChild(myTable);

    const fields = ["#", "Image", "Region", "Realm", "Name", "Class", "Spec", "Role", "iLvl", "IO"];
    // const dungeons = ["ARAK", "COT", "DAWN", "GB", "MISTS", "NW", "SIEGE", "SV"]
    let dungeons = ["x", "x", "x", "x", "x", "x", "x", "x"];
    const dungeonList = localStorage.getItem("dungeons");
    if (dungeonList) {
        dungeons = JSON.parse(dungeonList);
    }
    
    // add header row
    const header = document.createElement("tr");
    for (const field of fields) {
        const cell = document.createElement("th");
        cell.className = "rounded";
        if (field == "#") {
            cell.style.width = "1%";
        }
        else if (["Class", "Spec", "Role"].includes(field)) {
            cell.style.width = "8%";
            cell.style.textAlign = "left";
        }
        else if (["iLvl", "IO"].includes(field)) {
            cell.style.textAlign = "right";
            cell.style.width = "3%";
        }
        else {
            cell.style.textAlign = "left";
        }
        cell.innerText = field;
        header.appendChild(cell);
    }
    myTable.appendChild(header);

    // add dungeons
    for (const dungeon of dungeons) {
        const cell = document.createElement("th");
        cell.style.width = "3%";
        cell.style.textAlign = "center";
        cell.innerText = dungeon;
        header.appendChild(cell);
    }

    const extraHeaders = [
        "Updated",
        "Armory",
        "raider.io",
        "",
        "",
        "",
    ]


    for (const headerName of extraHeaders) {
        const extraHeader = document.createElement("th");
        if (headerName == "Updated") {
            extraHeader.style.width = "15%";
        }
        extraHeader.className = "rounded";
        extraHeader.style.textAlign = "left";
        extraHeader.innerText = headerName;
        header.appendChild(extraHeader);
    }

    let index = 1;
    for (const character of myCharacters.sort((a, b) => b.io - a.io || b.ilvl - a.ilvl)) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        //cell.style.width = "5%";
        cell.style.textAlign = "right";
        cell.innerText = index++;
        row.appendChild(cell);

        for (const field of fields) {
            if (field == "#") {
                continue;
            }
            if (field == "Image") {
                const imgCell = document.createElement("td");
                //imgCell.style.width = "10px";
                imgCell.style.textAlign = "center";
                const image = document.createElement("img");
                image.alt = "Character Thumbnail";
                image.src = character["thumbnail"];
                image.width = 50;
                imgCell.appendChild(image);
                row.appendChild(imgCell);
                continue;
            }
            const cell = document.createElement("td");
            //cell.style.width = "100px";
            if (["iLvl", "IO"].includes(field)) {
                cell.style.textAlign = "right";
            }
            else {
                cell.style.textAlign = "left";
            }
            if (field == "Name") {
                cell.style.fontWeight = "bold";
                if (character.mine) {
                    cell.style.color = "red";
                }
                // add click event to mark character as mine
                // and then highlight it in the list
                cell.onclick = function(event) {
                    if (character.mine) {
                        character.mine = false;
                    }
                    else {
                        character.mine = true;
                    }
                    saveData();
                    refreshTable();
                }
            }
            cell.innerText = character[field.toLowerCase()];
            row.appendChild(cell);
        }

        // loop thru all the dungeon scores
        for (const dungeon of dungeons) {
            const cell = document.createElement("td");
            //cell.style.width = "50px";
            cell.style.textAlign = "center";
            cell.innerText = "";
            if (character.best_runs) {
                if (dungeon in character.best_runs) {
                    const just_key = Number(character.best_runs[dungeon].split("*")[0]);
                    if ((just_key == 10 && character.best_runs[dungeon].includes("*")) || just_key >= 11) {
                        cell.style.color = "yellow";
                        cell.style.fontWeight = "bold";
                        cell.title = "Portal aquired!";
                    }
                    cell.innerText = character.best_runs[dungeon];
                }
            }
            row.appendChild(cell);
        }

        const updated = document.createElement("td");
        //updated.style.width = "200px";
        updated.innerText = character.updated.toLocaleString();
        row.appendChild(updated);

        // links
        const armoryLinkCell = document.createElement("td");
        armoryLinkCell.style.textAlign = "center";
        const armoryLink = document.createElement("a");
        armoryLink.title = "Armory";
        armoryLink.href = `https://worldofwarcraft.com/en-us/character/us/${character.realm}/${character.name}`;
        armoryLink.target = "_blank";
        const armoryImage = document.createElement("img");
        armoryImage.src = "img/armory.svg";
        armoryImage.width = 30;
        armoryLink.appendChild(armoryImage);
        armoryLinkCell.appendChild(armoryLink);
        row.appendChild(armoryLinkCell);

        const raiderioLinkCell = document.createElement("td");
        raiderioLinkCell.style.textAlign = "center";
        const raiderioLink = document.createElement("a");
        raiderioLink.title = "Armory";
        raiderioLink.href = `https://raider.io/characters/us/${character.realm}/${character.name}`;
        raiderioLink.target = "_blank";
        const raiderioImage = document.createElement("img");
        raiderioImage.src = "img/raiderio.svg";
        raiderioImage.width = 30;
        raiderioLink.appendChild(raiderioImage);
        raiderioLinkCell.appendChild(raiderioLink);
        row.appendChild(raiderioLinkCell);

        // delete buttom for each row
        const deleteButtonCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.character = character;
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", handleEvent);
        deleteButtonCell.appendChild(deleteButton);
        row.appendChild(deleteButtonCell);

        // update button for each row
        const updateButtonCell = document.createElement("td");
        updateButtonCell.style.borderRight = "none";
        const updateButton = document.createElement("button");
        updateButton.character = character;
        updateButton.innerText = "Update";
        updateButton.addEventListener("click", handleEvent);
        updateButtonCell.appendChild(updateButton);
        row.appendChild(updateButtonCell);

        // status icon colum
        const statusCell = document.createElement("td");
        //statusCell.style.width = "100px";
        statusCell.id = "statusCell-" + character.key;
        statusCell.style.textAlign = "center";
        statusCell.innerHTML = character.loading ? "<img src='img/load-37_256.gif' width='20px'/>" : "";
        row.appendChild(statusCell);

        myTable.appendChild(row);
    }

    // add row to table
    const update_all_row = document.createElement("tr");
    update_all_row.className = "rounded";
    const update_all_cell = document.createElement("td");
    update_all_cell.style.textAlign = "center";
    update_all_cell.colSpan = 24;
    const update_all_button = document.createElement("button");
    update_all_button.innerText = "Update All";
    update_all_button.addEventListener("click", handleEvent);
    update_all_row.appendChild(update_all_cell);
    update_all_cell.appendChild(update_all_button);
    myTable.appendChild(update_all_row);
}

function handleEvent(event) {
    // handle events for buttons
    const action = event.target.innerText;

    // update character
    if (action == "Update") {
        event.target.character.fetchCharacter().then(response => {
            if (response) {
                saveData();
                refreshTable();
            }
        });
    }
    // delete character
    else if (action == "Delete") {
        deleteCharacter(event.target.character);
    }
    // update all characters
    else if (action == "Update All") {
        reloadAllCharacters();
    }   
    else {
        console.error("Unknown action: %s", action);
    }
    
}

export function reloadAllCharacters() {
    // reload all characters
    for (const character of myCharacters) {
        character.fetchCharacter().then(response => {
            if (response) {
                saveData();
                refreshTable();
            }
        });
    }
}

function deleteCharacter(character) {
    // Delete character from the table 
    const index = myCharacters.indexOf(character);
    myCharacters.splice(index, 1);
    saveData();
    refreshTable();
}