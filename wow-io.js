let myCharacters = [];

class Character {
    constructor(realm, name) {
        this.realm = realm;
        this.name = name;
        this.class = null;
        this.spec = null;
        this.role = null;
        this.ilvl = null;
        this.io = null;
        this.best_runs = {};
        this.updated = null;
    }

    key() {
        return `${this.realm}-${this.name}`;
    }

    async fetchCharacter() {
        const myRequest = new Request("https://raider.io/api/v1/characters/profile?" + new URLSearchParams({
            "region": "us",
            "realm": this.realm,
            "name": this.name,
            "fields": "mythic_plus_scores_by_season:current,mythic_plus_best_runs,gear"
        }));

        const response = await fetch(myRequest);
        if (response.status == 500) {
            window.alert("Server error! Please try again later.");
            return;
        }
        const data = await response.json();
        if (data.statusCode == 400) {
            window.alert(data.message);
            return;
        }
        this.class = data.class;
        this.spec = data.active_spec_name;
        this.role = data.active_spec_role;
        this.ilvl = Math.round(data.gear.item_level_equipped);
        this.io = data.mythic_plus_scores_by_season[0].scores.all;

        // get best key runs
        const runs = {};
        for (const run of data.mythic_plus_best_runs) {
            let key_level = run.mythic_level.toString();
            if (run.num_keystone_upgrades > 0) {
                key_level += "*".repeat(run.num_keystone_upgrades);
            }
            runs[run.short_name] = key_level;
        }
        this.best_runs = runs;
        this.updated = new Date();

        return true;
  }
}

loadData();

// add character form
const formDiv = document.getElementById("addCharacterDiv");
const form = document.createElement("form");
form.id = "addNewCharacterForm";
const realmInput = document.createElement("select");
realmInput.id = "inputRealm";
realmInput.type = "text";
const realms = ["Fizzcrank", "Aggramar"];
for (const realm of realms) {
    const option = document.createElement("option");
    if (realm == "Fizzcrank") {
        option.selected = true;
    }
    option.value = realm;
    option.innerText = realm;
    realmInput.appendChild(option);
}
form.appendChild(realmInput);

// Character name input
const characterInput = document.createElement("input");
characterInput.id = "inputCharacter";
characterInput.type = "text";
characterInput.placeholder = "Character";
form.appendChild(characterInput);

const submitButton = document.createElement("button");
submitButton.type = "submit";
submitButton.innerText = "Add Character";
form.appendChild(submitButton);
formDiv.appendChild(form);

document.getElementById("addNewCharacterForm").addEventListener("submit", clicked);

function clicked(event) {
    // prevent a reload
    event.preventDefault();

    const newCharacterRealm = document.getElementById("inputRealm").value;
    const newCharacterName = document.getElementById("inputCharacter").value;  

    // check if character already exists
    for (const character of myCharacters) {
        if (character.realm == newCharacterRealm && character.name == newCharacterName) {
            window.alert("Character already exists!");
            return;
        }
    }

    // add new character
    const newCharacter = new Character(newCharacterRealm, newCharacterName);
    newCharacter.fetchCharacter().then(response => {
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
            const newCharacter = new Character(character.realm, character.name);
            newCharacter.class = character.class;
            newCharacter.spec = character.spec;
            newCharacter.role = character.role;
            newCharacter.ilvl = character.ilvl;
            newCharacter.io = character.io;
            newCharacter.best_runs = character.best_runs;
            newCharacter.updated = new Date(character.updated);
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

    const fields = ["#", "Realm", "Name", "Class", "Spec", "Role", "iLvl", "IO"];
    const dungeons = ["ARAK", "COT", "DAWN", "GB", "MISTS", "NW", "SIEGE", "SV"]

    // add header row
    const header = document.createElement("tr");
    for (const field of fields) {
        const cell = document.createElement("th");
        if (field == "#") {
            cell.style.width = "20px";
        }
        else if (field == "Spec") {
            cell.style.width = "200px";
        }
        else {
            cell.style.width = "100px";
        }
        if (["iLvl", "IO", "#"].includes(field)) {
            cell.style.textAlign = "right";
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
        cell.style.width = "50px";
        cell.style.textAlign = "center";
        cell.innerText = dungeon;
        header.appendChild(cell);
    }

    const updated = document.createElement("th");
    updated.style.width = "200px";
    updated.style.textAlign = "left";
    updated.innerText = "Updated";
    header.appendChild(updated);

    for (let i = 0; i < 2; i++) {
        const cell = document.createElement("th");
        cell.innerText = "";
        header.appendChild(cell);
    }

    let index = 1;
    for (const character of myCharacters.sort((a, b) => b.io - a.io)) {
        const row = document.createElement("tr");
        if (index % 2 == 0) {
            row.style.backgroundColor = "#707070";
        }
        const cell = document.createElement("td");
        cell.style.width = "20px";
        cell.style.textAlign = "right";
        cell.innerText = index++;
        row.appendChild(cell);

        for (const field of fields) {
            if (field == "#") {
                continue;
            }
            const cell = document.createElement("td");
            cell.style.width = "100px";
            if (["iLvl", "IO"].includes(field)) {
                cell.style.textAlign = "right";
            }
            else {
                cell.style.textAlign = "left";
            }
            cell.innerText = character[field.toLowerCase()];
            row.appendChild(cell);
        }

        for (const dungeon of dungeons) {
            const cell = document.createElement("td");
            cell.style.width = "50px";
            cell.style.textAlign = "center";
            cell.innerText = "";
            if (character.best_runs) {
                if (dungeon in character.best_runs) {
                    cell.innerText = character.best_runs[dungeon];
                }
            }
            row.appendChild(cell);
        }

        const updated = document.createElement("td");
        updated.style.width = "200px";
        updated.innerText = character.updated.toLocaleString();
        row.appendChild(updated);

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
        const updateButton = document.createElement("button");
        updateButton.character = character;
        updateButton.innerText = "Update";
        updateButton.addEventListener("click", handleEvent);
        updateButtonCell.appendChild(updateButton);
        row.appendChild(updateButtonCell);

        myTable.appendChild(row);

    }

    // add row to table
    const update_all_row = document.createElement("tr");
    const update_all_cell = document.createElement("td");
    update_all_cell.style.textAlign = "center";
    update_all_cell.colSpan = 19;
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
        for (const character of myCharacters) {
            character.fetchCharacter().then(response => {
                if (response) {
                    saveData();
                    refreshTable();
                }
            });
        }
    }   
    else {
        console.error("Unknown action: %s", action);
    }
    
}

function deleteCharacter(character) {
    // Delete character from the table 
    const index = myCharacters.indexOf(character);
    myCharacters.splice(index, 1);
    saveData();
    refreshTable();
}