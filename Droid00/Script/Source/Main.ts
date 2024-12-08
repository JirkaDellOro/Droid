namespace Script {
  import ƒ = FudgeCore;

  export interface STATE {
    [module: string]: { [property: string]: unknown }
  }
  export interface COMMAND {
    module: string, method: string, data?: unknown
  }

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(-5)
    cmpCamera.mtxPivot.translateY(5)
    cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO())
    viewport.camera = cmpCamera

    let droid: ƒ.Node = viewport.getBranch().getChildrenByName("Droid")[0]
    // let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)

     const process = (): void => {
      let command: COMMAND = getCommand({})
      let component = droid.getChildrenByName(command.module)[0].getComponent(Reflect.get(Script, command.module));
      let method: Function = Reflect.get(component, command.method).bind(component)
      method(command.data).then(process)
    }
    process()
    
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function getCommand(_state: STATE): COMMAND {
    let command: COMMAND = { module: "Chassis", method: "move", data: "forward" }
    return command
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}