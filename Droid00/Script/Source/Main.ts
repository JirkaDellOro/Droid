namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    let droid: ƒ.Node = viewport.getBranch().getChildrenByName("Droid")[0]
    let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
    await chassis.move(DIRECTION.LEFT)
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}