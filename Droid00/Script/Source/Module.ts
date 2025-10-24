namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export interface State {
    [module: string]: object
  }
  export interface Command {
    module: string, method: string, data?: unknown
  }
  export interface Description {
    method: string, data: string
  }

  export abstract class Module extends ƒ.ComponentScript {
    public hndEvent: ƒ.EventListenerUnified;

    public constructor() {
      super();

      this.hndEvent = this.hndEventUnbound.bind(this);
      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    public async logDescription(): Promise<void> {
      await ƒ.Time.game.delay(3000);
      console.log("Description for module " + this.constructor.name, this.getDescription());
    }

    protected getDescription(): Description[] {
      const prototype: object = Reflect.getPrototypeOf(this);
      const keys: (string | symbol)[] = Reflect.ownKeys(prototype);
      const description: Description[] = [];

      for (const key of keys)
        if (["constructor", "hndEventUnbound", "getDescription", "getState"].indexOf(<string>key) != -1)
          continue;
        else
          description.push({method: Reflect.get(this, key).toString().split("{")[0], data:"unknown"});

      return description;
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
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          console.log("Module");
          this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.hndEvent);
          this.node.dispatchEvent(new CustomEvent(EVENT.REGISTER_MODULE, { bubbles: true, detail: this }));
          break;
      }
    }

    public abstract getState(): object
  }
}