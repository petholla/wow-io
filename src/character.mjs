// wow character class

export default class Character {
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
        this.thumbnail = null;
        this.status = "";
        this.mine = false;
    }

    get key() {
        return `${this.realm}-${this.name}`;
    }

    async fetchCharacter() {
        // fetch character data from raider.io
        this.status = "loading";
        const cell = document.getElementById("statusCell-" + this.key);
        if (cell) {
            document.getElementById("statusCell-" + this.key).innerHTML = "<img src='img/load-37_256.gif' width='20px' height='20px' />";
        }

        //await sleep(1000);

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
        this.updated = new Date();

        return true;
  }
}