namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class Module extends ƒ.ComponentScript {
    public hndEvent: ƒ.EventListenerUnified

    constructor() {
      super();

      this.hndEvent = this.hndEventUnbound.bind(this)
      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }


    public getDescription(): string[] {
      let prototype = Reflect.getPrototypeOf(this)
      let keys = Reflect.ownKeys(prototype)
      let methods: string[] = []

      for (let key of keys)
        if (key == "constructor" || key == "hndEventUnbound")
          continue
        else
          methods.push(Reflect.get(this, key).toString().split("{")[0])

      return methods
    }

    
    protected hndEventUnbound(_event: CustomEvent): void {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
          this.node.removeEventListener(ƒ.EVENT.RENDER_PREPARE, this.hndEvent);
          this.node.removeEventListener(EVENT.REGISTER_MODULE, this.hndEvent, true);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          this.node.addEventListener(EVENT.REGISTER_MODULE, this.hndEvent, true);
          this.node.dispatchEvent(new CustomEvent(EVENT.REGISTER_MODULE, { bubbles: true, detail: this }))
          break;
        case EVENT.REGISTER_MODULE:
          this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.hndEvent);
          _event.detail.dispatchEvent(new CustomEvent(EVENT.REGISTER_MODULE, { detail: this }))
          break
      }
    }
  }
}