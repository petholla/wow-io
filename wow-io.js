let myCharacters = [];

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
    event.preventDefault();
    console.log("Clicked!");
    const realm = document.getElementById("inputRealm").value;
    const characterName = document.getElementById("inputCharacter").value;
    const characterObj = {
        realm: realm,
        character: characterName,
        spec: "unknown",
        role: "unknown",
        ilvl: 0,
        io: 0,
        best_runs: {},
    };
    myCharacters.push(characterObj);

    saveData();
    updateCharacter(characterObj);

    refreshTable();
}

function saveData() {
    console.log("Saving data...");
    localStorage.setItem("ioCharacters", JSON.stringify(myCharacters));
}

function loadData() {
    console.log("Loading data...");
    const data = localStorage.getItem("ioCharacters");
    if (data) {
        myCharacters = JSON.parse(data);
    }

    refreshTable();
}

function refreshTable() {
    console.log("Refreshing table...");
    const tableBody = document.getElementById("characterTableDiv");
    tableBody.innerHTML = "";
    const myTable = document.createElement("table");
    tableBody.appendChild(myTable);

    const fields = ["#", "Realm", "Character", "Role", "Spec", "iLvl", "IO"];
    const dungeons = ["ARAK", "COT", "DAWN", "GB", "MISTS", "NW", "SIEGE", "SV"]

    // add header row
    const header = document.createElement("tr");
    for (const field of fields) {
        const cell = document.createElement("th");
        if (field == "#") {
            cell.style.width = "20px";
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

    let index = 1;
    for (const character of myCharacters.sort((a, b) => b.io - a.io)) {
        const row = document.createElement("tr");
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

        // delete buttom for each row
        const deleteButton = document.createElement("button");
        deleteButton.character = character;
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", handleEvent);
        row.appendChild(deleteButton);

        const updateButton = document.createElement("button");
        updateButton.character = character;
        updateButton.innerText = "Update";
        updateButton.addEventListener("click", handleEvent);
        row.appendChild(updateButton);
        
        myTable.appendChild(row);
    }
}

function handleEvent(event) {
    console.log("Handing %s event for %s", event.target.innerText, event.target.character.character);
    const action = event.target.innerText;

    if (action == "Update") {
        updateCharacter(event.target.character);
    }
    else if (action == "Delete") {
        deleteCharacter(event.target.character);
    }
    else {
        console.error("Unknown action: %s", action);
    }
    
}

function updateCharacter(character) {
    // Update character from raider.io
    console.log(`Updating character: ${character.character}`);
    const myRequest = new Request("https://raider.io/api/v1/characters/profile?" + new URLSearchParams({
        "region": "us",
        "realm": character.realm,
        "name": character.character,
        "fields": "mythic_plus_scores_by_season:current,mythic_plus_best_runs,gear"
    
    }));
    fetch(myRequest)
        .then(response => response.json())
        .then(data => {
            character.spec = data.active_spec_name;
            character.ilvl = Math.round(data.gear.item_level_equipped);
            character.io = data.mythic_plus_scores_by_season[0].scores.all;
            character.role = data.active_spec_role;
            // get best key runs
            const runs = {};
            for (const run of data.mythic_plus_best_runs) {
                let key_level = run.mythic_level.toString();
                if (run.num_keystone_upgrades > 0) {
                    key_level += "*".repeat(run.num_keystone_upgrades);
                }
                runs[run.short_name] = key_level;
            }
            character.best_runs = runs;
            saveData();
            refreshTable();
        });
}

function deleteCharacter(character) {
    // Delete character from the table 
    console.log("Delete button clicked!");
    const index = myCharacters.indexOf(character);
    myCharacters.splice(index, 1);
    saveData();
    refreshTable();
}