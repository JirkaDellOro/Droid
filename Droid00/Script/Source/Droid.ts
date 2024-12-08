namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export enum EVENT {
    MOVE = "move", CONSOLIDATE = "consolidate", REGISTER_MODULE = "registerModule"
  }

  export class Droid extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(Droid)

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
      this.addEventListener(EVENT.REGISTER_MODULE, this.hndEvent)
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          this.node.addEventListener(EVENT.MOVE, this.hndEvent)
          this.node.addEventListener(EVENT.CONSOLIDATE, this.hndEvent)
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
          this.node.removeEventListener(EVENT.MOVE, this.hndEvent)
          this.node.removeEventListener(EVENT.CONSOLIDATE, this.hndEvent)
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          this.node.broadcastEvent(new CustomEvent(EVENT.REGISTER_MODULE, { detail: this }))
          break;
        case EVENT.MOVE:
          this.node.mtxLocal.translateZ(_event.detail.translation)
          this.node.mtxLocal.rotateY(_event.detail.rotation)
          break
        case EVENT.REGISTER_MODULE:
          console.log(_event.detail)
          break
      }
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}