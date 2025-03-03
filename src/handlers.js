export function closePopUpHandlers() {
    // catch escape if floaing windows are up
    document.onkeydown = function(event) {
        if ( event.key != "Escape" ) {
            return;
        }

        console.log("Escape key.")
        closePopUp();
    }
}

function closePopUp() {
    // close the floating window
    const popUp = document.getElementById("popUpDiv");
    if (popUp) {
        popUp.remove();
    }
}