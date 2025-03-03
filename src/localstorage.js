import { Character } from "./character.js";

export let myCharacters = [];

export function saveData() {
    // save data to local storage
    localStorage.setItem("ioCharacters", JSON.stringify(myCharacters));
}

export function loadData() {
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
}

function deleteCharacter(character) {
    // Delete character from the table 
    const index = myCharacters.indexOf(character);
    myCharacters.splice(index, 1);
    saveData();
    refreshTable();
}