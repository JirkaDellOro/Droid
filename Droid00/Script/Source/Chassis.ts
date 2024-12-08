namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export enum DIRECTION {
    STOP, FORWARD, BACK, LEFT, RIGHT
  }

  export class Chassis extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(Chassis)
    public static readonly directions: Map<DIRECTION, number[]> = new Map([
      [DIRECTION.FORWARD, [1, 1]], [DIRECTION.BACK, [-1, -1]], [DIRECTION.LEFT, [1, -1]], [DIRECTION.RIGHT, [-1, 1]], [DIRECTION.STOP, [0, 0]],
    ])
    public speedWheel: number = 360 // angle to turn wheels in one second
    public timeToMove: number = 1 // Seconds to perform a move to the next tile or a 90 degree turn
    public direction: DIRECTION = DIRECTION.STOP
    #left: ƒ.Node[] = []
    #right: ƒ.Node[] = []

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    public async move(_direction: DIRECTION): Promise<void> {
      this.direction = _direction
      const translation: number = _direction == DIRECTION.FORWARD ? 1 : _direction == DIRECTION.BACK ? -1 : 0
      const rotation: number = 90 *(_direction == DIRECTION.LEFT ? 1 : _direction == DIRECTION.RIGHT ? -1 : 0)

      let promise: Promise<void> = new Promise<void>((_resolve) => {
        // let timer: ƒ.Timer = new ƒ.Timer()
        const fps: number = 25; // framerate for the movement of the chassis in frames per second
        const frames = this.timeToMove * fps // number of frames for movement
        
        const hndTimer = (_event: ƒ.EventTimer): void => {
          console.log(_event.count)

          this.node.mtxLocal.translateZ(translation/frames)
          this.node.mtxLocal.rotateY(rotation/frames)

          if (_event.lastCall)
            _resolve()
        }

        ƒ.Time.game.setTimer(1000 / fps, frames, hndTimer)
      })
      await promise
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
          ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.hndEvent);
          this.#left = this.node.getChildren().filter((_node: ƒ.Node) => _node.name.startsWith("WheelL"));
          this.#right = this.node.getChildren().filter((_node: ƒ.Node) => _node.name.startsWith("WheelR"));
          break;
        case ƒ.EVENT.LOOP_FRAME:
          let timeElapsed: number = ƒ.Loop.timeFrameGame / 1000
          const left: number = timeElapsed * this.speedWheel * Chassis.directions.get(this.direction)[0]
          const right: number = timeElapsed * this.speedWheel * Chassis.directions.get(this.direction)[1]
          this.#left.forEach(_wheel => _wheel.mtxLocal.rotateX(left))
          this.#right.forEach(_wheel => _wheel.mtxLocal.rotateX(right))
          break;
      }
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}