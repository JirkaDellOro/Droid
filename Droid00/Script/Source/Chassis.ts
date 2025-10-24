namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export enum DIRECTION {
    STOP = "stop", FORWARD = "forward", BACK = "back", LEFT = "left", RIGHT = "right"
  }

  export class Chassis extends Module {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(Chassis);
    public static readonly directions: Map<DIRECTION, number[]> = new Map([
      [DIRECTION.FORWARD, [1, 1]], [DIRECTION.BACK, [-1, -1]], [DIRECTION.LEFT, [1, -1]], [DIRECTION.RIGHT, [-1, 1]], [DIRECTION.STOP, [0, 0]],
    ]);
    public speedWheel: number = 360; // angle to turn wheels in one second
    public timeToMove: number = 1; // Seconds to perform a move to the next tile or a 90 degree turn
    #direction: DIRECTION = DIRECTION.STOP;
    #left: ƒ.Node[] = [];
    #right: ƒ.Node[] = [];

    public getState(): object {
      const state: object = {
        position: this.node.mtxWorld.translation,
        rotation: this.node.mtxWorld.rotation,
      };
      return state;
    }

    public async move(_direction: DIRECTION): Promise<void> {
      this.#direction = _direction;
      const translation: number = _direction == DIRECTION.FORWARD ? 1 : _direction == DIRECTION.BACK ? -1 : 0;
      const rotation: number = 90 * (_direction == DIRECTION.LEFT ? 1 : _direction == DIRECTION.RIGHT ? -1 : 0);

      const promise: Promise<void> = new Promise<void>((_resolve) => {
        // let timer: ƒ.Timer = new ƒ.Timer()
        const fps: number = 25; // framerate for the movement of the chassis in frames per second
        const frames: number = this.timeToMove * fps; // number of frames for movement

        const hndTimer = (_event: ƒ.EventTimer): void => {
          this.node.dispatchEvent(new CustomEvent("move", {
            bubbles: true, detail: { translation: translation / frames, rotation: rotation / frames }
          }));

          if (_event.lastCall) {
            this.node.dispatchEvent(new CustomEvent("consolidate", { bubbles: true, }));
            _resolve();
          }
        };

        ƒ.Time.game.setTimer(1000 / fps, frames, hndTimer);
      });
      await promise;
    }

    // Activate the functions of this component as response to events
    protected hndEventUnbound(_event: CustomEvent): void {
      super.hndEventUnbound(_event);

      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          this.#left = this.node.getChildren().filter((_node: ƒ.Node) => _node.name.startsWith("WheelL"));
          this.#right = this.node.getChildren().filter((_node: ƒ.Node) => _node.name.startsWith("WheelR"));
          break;
        case ƒ.EVENT.RENDER_PREPARE:
          const timeElapsed: number = ƒ.Loop.timeFrameGame / 1000;
          const left: number = timeElapsed * this.speedWheel * Chassis.directions.get(this.#direction)[0];
          const right: number = timeElapsed * this.speedWheel * Chassis.directions.get(this.#direction)[1];
          this.#left.forEach(_wheel => _wheel.mtxLocal.rotateX(left));
          this.#right.forEach(_wheel => _wheel.mtxLocal.rotateX(right));
          break;
      }
    }

    protected getDescription(): Description[] {
      const description: Description[] = [];
      description.push({ method: "move", data: "one of the following strings: forward, back, left, right, stop" });
      return description;
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}