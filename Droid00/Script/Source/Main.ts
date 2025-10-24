namespace Script {
  import ƒ = FudgeCore;

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let getCommand: (_state: State) => Command = getCommandInternal;
  let droid: ƒ.Node;

  async function getAgents(): Promise<void> {
    const url: string = "../../../Agent.js";
    // let url: string = "https://jirkadelloro.github.io/Agent/Agent.js"
    //@ts-expect-error import requires specific module configuration in tsconfig that is incompatible with outfile
    const agent: ƒ.General = (await import(url)).default;

    await agent.createDialog(1, ["getCommand"]);
    getCommand = agent.get(0).getCommand;
  }

  async function start(_event: CustomEvent): Promise<void> {
    await getAgents();

    viewport = _event.detail;

    const cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translateZ(-5);
    cmpCamera.mtxPivot.translateY(5);
    cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
    viewport.camera = cmpCamera;

    droid = viewport.getBranch().getChildrenByName("Droid")[0];
    // let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)

    const process = (): void => {
      ƒ.Render.prepare(droid);
      const state: State = droid.getComponent(Droid).getState();
      const command: Command = getCommand(state);
      const component: ƒ.Component = droid.getChildrenByName(command.module)[0].getComponent(Reflect.get(Script, command.module));
      const method: (_data: unknown) => Promise<void> = Reflect.get(component, command.method).bind(component);
      method(command.data).then(process);
    };
    process();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function getCommandInternal(_state: State): Command {
    for (const module in _state)
      console.table(_state[module]);
    const data: string = DIRECTION[ƒ.Random.default.getPropertyName(DIRECTION)];
    const command: Command = { module: "Chassis", method: "move", data: data };
    return command;
  }

  function update(): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}