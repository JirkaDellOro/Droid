namespace Agent00 {
  interface STATE {
    [module: string]: Object
  }
  interface COMMAND {
    module: string, method: string, data?: unknown
  }

  export function getCommand(_state: STATE): COMMAND {
    let command: COMMAND = {module: "", method: ""}
    return command
  }
}