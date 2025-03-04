import { sleep, logMessage } from "./common.js";
import { myCharacters, saveData} from "./localstorage.js";
import { refreshTable } from "./charactertable.js";

// wow character class

export class Character {
    constructor(region, realm, name) {
        this.region = region;
        this.realm = realm;
        this.name = name;
        this.class = null;
        this.spec = null;
        this.role = null;
        this.ilvl = null;
        this.io = null;
        this.best_runs = {};
        this.updated = null;
        this.thumbnail = null;
        this.status = "";
        this.mine = false;
        this.loading = false;
    }

    // get the key for this character
    get key() {
        return `${this.realm}-${this.name}`;
    }

    delete() {
        // delete this character
        const index = myCharacters.indexOf(this);
        myCharacters.splice(index, 1);
        saveData();
        refreshTable();
    }

    async fetchCharacter() {
        // fetch character data from raider.io
        this.loading = true;
        const cell = document.getElementById("statusCell-" + this.key);
        if (cell) {
            document.getElementById("statusCell-" + this.key).innerHTML =
                "<img src='img/load-37_256.gif' width='20px' height='20px' />";
        }

        let season = localStorage.getItem("currentSeason");

        const myRequest = new Request(
            "https://raider.io/api/v1/characters/profile?" +
                new URLSearchParams({
                    region: this.region,
                    realm: this.realm,
                    name: this.name,
                    fields: `mythic_plus_scores_by_season:${season},mythic_plus_best_runs,gear`,
                })
        );

        // add a little delay so we're not DDOSing the server
        const random = Math.random() * 2000;
        await sleep(random);

        const response = await fetch(myRequest);

        this.loading = false;

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

        let changed = false;

        // look for ilvl changes
        const newIlvl = Math.round(data.gear.item_level_equipped);
        logMessage(`${this.key} ilvl: ${newIlvl}`);
        if (this.ilvl != newIlvl) {
            this.ilvl = newIlvl;
            changed = true;
        }

        // look for io changes
        const newIO = data.mythic_plus_scores_by_season[0].scores.all;
        logMessage(`${this.key} io: ${newIO}`);
        if (this.io != newIO) {
            this.io = newIO;
            changed = true;
        }

        // set thumbnail
        this.thumbnail = data.thumbnail_url;

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

        // update the last updated time if anything changed
        if (changed) {
            this.updated = new Date();
        }

        saveData();
        refreshTable();

        return true;
    }
}
