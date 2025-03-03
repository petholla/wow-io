import { Character } from "./character.js";
import { addNewCharacterForm, addNotesSection, addAdminSection, addSeasonSelector } from "./ui.js";
import { refreshCounter } from "./refresh.js";
import { setDebugMode, logMessage, sleep, get_seasons } from "./common.js";
import { loadData, saveData } from "./localstorage.js";
import { refreshTable, reloadAllCharacters } from "./charactertable.js";
import { myCharacters } from "./localstorage.js";

addNewCharacterForm(addCharacterHandler);

await addSeasonSelector();

// load data from browser storage
loadData();

refreshTable();

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

export async function addCharacter(region, realm, name) {
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
    await newCharacter.fetchCharacter().then(response => {
        if (response) {
            myCharacters.push(newCharacter);
            saveData();
            refreshTable();
        }
    });
}
