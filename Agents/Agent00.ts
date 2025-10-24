export namespace Agent00 {
  interface STATE {
    [module: string]: Object
  }
  interface COMMAND {
    module: string, method: string, data?: unknown
  }

  export function getCommand(_state: STATE): COMMAND {
    console.log(_state);
    // let command: COMMAND = {module: "Chassis", method: "move", data: "forward"}
    let command: COMMAND = {module: "Chassis", method: "logDescription"};
    return command;
  }
}