export var Agent00;
(function (Agent00) {
    function getCommand(_state) {
        console.log(_state);
        // let command: COMMAND = {module: "Chassis", method: "move", data: "forward"}
        const command = { module: "Chassis", method: "logDescription" };
        return command;
    }
    Agent00.getCommand = getCommand;
})(Agent00 || (Agent00 = {}));
