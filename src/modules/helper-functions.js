const helperFunctions = {

    //Seconds to Minutes: 42 -> "00:42", 78 -> "01:18"
    secondsToMinutes: function(seconds) {
        let secs = Math.floor(seconds % 60);
        secs = secs < 10 ? "0" + secs : "" + secs;

        let mins = Math.floor(seconds / 60);
        mins = mins < 10 ? "0" + mins : "" + mins;

        return (mins + ":" + secs);
    }

}

export default helperFunctions;