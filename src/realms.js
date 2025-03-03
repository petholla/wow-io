import { bigPopUp, reloadRealmSelector } from "./ui.js"
import { capitalize } from "./common.js";

export function sortRealms(a, b) {
    const realm1 = `${a.region}-${a.realm}`;
    const realm2 = `${b.region}-${b.realm}`;
    return realm1.localeCompare(realm2);
}

export class RealmManager {
    constructor() {
        this.div = null;
    }

    editRealms() {
        var popUp = document.getElementById("popUpDiv");
        if (popUp) {
            return;
        }
        popUp = bigPopUp("popUpDiv");
        popUp.appendChild(document.createElement("br"));

        this.div = popUp;

        this.drawRealmTable();
    }

    drawRealmTable() {
        // draw the realm table

        // remove the existing table
        if (document.getElementById("realmTable")) {
            document.getElementById("realmTable").remove();
        }

        const table = document.createElement("table");
        table.id = "realmTable";
        table.style.width = "60%";
        table.style.margin = "auto";
        this.div.appendChild(table);
        const headerRow = document.createElement("tr");
        table.appendChild(headerRow);
        for (const header of ["Region", "Realm", ""]) {
            const th = document.createElement("th");
            th.className = "rounded";
            th.innerText = header;
            if (header == "Region") {
                th.style.width = "10%";
            }
            headerRow.appendChild(th);
        }

        const storedRealms = JSON.parse(localStorage.getItem("realms")) || [];
        for (const storedRealm of storedRealms.toSorted(sortRealms)) {
            const row = document.createElement("tr");
            table.appendChild(row);
            const regionCell = document.createElement("td");
            regionCell.innerText = storedRealm.region;
            row.appendChild(regionCell);
            const realmCell = document.createElement("td");
            realmCell.innerText = storedRealm.realm;
            row.appendChild(realmCell);
            const deleteCell = document.createElement("td");
            row.appendChild(deleteCell);
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.region = storedRealm.region;
            deleteButton.realm = storedRealm.realm;
            deleteButton.onclick = this.deleteRealmHandler.bind(this);
            deleteCell.appendChild(deleteButton);
        }

        const addRow = document.createElement("tr");
        table.appendChild(addRow);
        const addRegion = document.createElement("td");
        addRow.appendChild(addRegion);
        const regionSelect = document.createElement("select");
        regionSelect.id = "regionSelect";
        addRegion.appendChild(regionSelect);
        for (const region of ["us", "eu", "kr", "tw", "cn"]) {
            const option = document.createElement("option");
            option.value = region;
            option.innerText = region;
            regionSelect.appendChild(option);
        }
        const addRealm = document.createElement("td");
        addRow.appendChild(addRealm);
        const realmInput = document.createElement("input");
        realmInput.id = "realmInput";
        realmInput.type = "text";
        realmInput.placeholder = "Realm";
    
        addRealm.appendChild(realmInput);
        realmInput.onkeyup = this.addRealmHandler.bind(this);

        const addCell = document.createElement("td");
        addRow.appendChild(addCell);
        const addButton = document.createElement("button");
        addButton.innerText = "Add";
        addButton.onclick = this.addRealmHandler.bind(this);
        addCell.appendChild(addButton);
        realmInput.focus();

        reloadRealmSelector();
    }

    getRealms() {
        return JSON.parse(localStorage.getItem("realms")) || [];
    }

    addRealmHandler(event) {
        if (event.type == "keyup" && event.key != "Enter") {
            return;
        }
        const region = document.getElementById("regionSelect").value;
        let realm = document.getElementById("realmInput").value;
        if (!realm) {
            alert("Realm name is required.");
            return;
        }
        realm = capitalize(realm);
        const storedRealms = this.getRealms();
        for (const storedRealm of storedRealms) {
            if (storedRealm.region == region && storedRealm.realm == realm) {
                alert("Realm already exists.");
                return;
            }
        }

        storedRealms.push({ region: region, realm: realm });
        localStorage.setItem("realms", JSON.stringify(storedRealms));
        this.drawRealmTable();
    }

    saveRealms(newRealms) {
        localStorage.setItem("realms", JSON.stringify(newRealms));
    }

    deleteRealmHandler(event) {
        const storedRealms = this.getRealms();
        for (const storedRealm of storedRealms) {
            if (storedRealm.region == event.target.region && storedRealm.realm == event.target.realm) {
                storedRealms.splice(storedRealms.indexOf(storedRealm), 1);
                break;
            }
        }
        this.saveRealms(storedRealms);
        this.drawRealmTable();
    }
}