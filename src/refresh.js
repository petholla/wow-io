export class refreshCounter {
    // refresh counter class
    constructor() {
        if (localStorage.getItem("refreshPeriodMinutes")) {
            this.minutes = localStorage.getItem("refreshPeriodMinutes");
        }
        else {
            this.minutes = 15;
        }

        addRefreshSection();

        const refreshSelector = document.getElementById("refreshSelector");
        refreshSelector.addEventListener("change", this.updatePeriod);
        refreshSelector.value = this.minutes;

        const refreshButton = document.getElementById("refreshButton");
        refreshButton.addEventListener("click", this.buttonPress);

        this.counter = this.seconds;
    }

    get seconds() {
        // return the refresh period in seconds
        return this.minutes * 60;
    }

    save = () => {
        // save the refresh period
        localStorage.setItem("refreshPeriodMinutes", this.minutes);    
    }

    start = () => {
        // start the refresh counter
        this.interval = setInterval(this.updateCounterCell, 1000)
    }

    stop = () => {
        // stop the refresh counter
        clearInterval(this.interval);
        this.interval = null;
        const refreshDiv = document.getElementById("refreshCounter");
        refreshDiv.innerText = "stopped";
    }

    buttonPress = (event) => {
        // start or stop the refresh counter
        if (this.interval) {
            this.stop();
            event.target.innerText = "Start";
        }
        else {
            this.start();
            event.target.innerText = "Stop";
        }
    }

    updateCounterCell = () => {
        // increment the counter
        const refreshDiv = document.getElementById("refreshCounter");
        this.counter--;
        refreshDiv.innerText = `${this.counter} s`;
        if (this.counter == 0) {
            reloadAllCharacters();
            this.counter = this.seconds;
        }
    };

    updatePeriod = (event) => {
        // change the refresh counter
        console.log(event.target.value);
        this.minutes = event.target.value;
        this.counter = this.seconds;
        this.save();
    }
    
}

// create the refresh section
function addRefreshSection(minutes) {
    const refreshDiv = document.getElementById("refreshDiv");
    const refreshTable = document.createElement("table");
    refreshTable.id = "refreshTable";
    refreshDiv.appendChild(refreshTable);
    const headerRow = document.createElement("tr");
    refreshTable.appendChild(headerRow);
    for (const header of ["Auto refresh", "Refresh in", ""]) {
        const th = document.createElement("th");
        th.className = "rounded";
        th.innerText = header;
        headerRow.appendChild(th);
    }
    const refreshRow = document.createElement("tr");
    refreshTable.appendChild(refreshRow);
    const refreshCell = document.createElement("td");
    refreshRow.appendChild(refreshCell);

    const textNodeBefore = document.createTextNode("Every ");
    refreshCell.appendChild(textNodeBefore);

    const refreshSelector = document.createElement("select");
    refreshSelector.id = "refreshSelector";
    refreshCell.appendChild(refreshSelector);
    const refreshOptions = [1, 5, 15, 30, 60];
    for (const option of refreshOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.innerText = option;
        refreshSelector.appendChild(optionElement);
        if ( option == minutes) {
            optionElement.selected = true;
        }
    }

    const textNode = document.createTextNode(" minute(s)");
    refreshCell.appendChild(textNode);
//    refreshCell.textContent += " minutes";

    const refreshCounterCell = document.createElement("td");
    refreshCounterCell.id = "refreshCounter";
    refreshCounterCell.style.textAlign = "right";
    refreshRow.appendChild(refreshCounterCell);

    const refreshButton = document.createElement("button");
    refreshButton.innerText = "Stop";
    refreshButton.id = "refreshButton";
    const refreshButtonCell = document.createElement("td");
    refreshButtonCell.appendChild(refreshButton);
    refreshRow.appendChild(refreshButtonCell);
}