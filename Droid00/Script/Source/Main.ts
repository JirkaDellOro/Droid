namespace Script {
  import ƒ = FudgeCore;

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let getCommand: Function = getCommandInternal 
  let droid: ƒ.Node

  async function getAgents(): Promise<void> {
    // let url: string = "../../../Agent.js"
    let url: string = "https://jirkadelloro.github.io/Agent/Agent.js"
    //@ts-ignore
    let Agent = (await import(url)).default;

    await Agent.createDialog(1, ["getCommand"])
    getCommand = Agent.get(0).getCommand
  }

  async function start(_event: CustomEvent): Promise<void> {
    // await getAgents();

    viewport = _event.detail;

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(-5)
    cmpCamera.mtxPivot.translateY(5)
    cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO())
    viewport.camera = cmpCamera

    droid = viewport.getBranch().getChildrenByName("Droid")[0]
    // let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)

    const process = (): void => {
      ƒ.Render.prepare(droid)
      //viewport.draw()
      //@ts-ignore
      console.table(droid.getComponent(Droid).getState()["Chassis"])
      let command: COMMAND = getCommand({})
      let component = droid.getChildrenByName(command.module)[0].getComponent(Reflect.get(Script, command.module));
      let method: Function = Reflect.get(component, command.method).bind(component)
      method(command.data).then(process)
    }
    process()

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function getCommandInternal(_state: STATE): COMMAND {
    let data: string = DIRECTION[ƒ.Random.default.getPropertyName(DIRECTION)]
    let command: COMMAND = { module: "Chassis", method: "move", data: data }
    return command
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}