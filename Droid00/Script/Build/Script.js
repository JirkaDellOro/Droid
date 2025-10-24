"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class Module extends ƒ.ComponentScript {
        constructor() {
            super();
            this.hndEvent = this.hndEventUnbound.bind(this);
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        async logDescription() {
            await ƒ.Time.game.delay(3000);
            console.log("Description for module " + this.constructor.name, this.getDescription());
        }
        getDescription() {
            const prototype = Reflect.getPrototypeOf(this);
            const keys = Reflect.ownKeys(prototype);
            const description = [];
            for (const key of keys)
                if (["constructor", "hndEventUnbound", "getDescription", "getState"].indexOf(key) != -1)
                    continue;
                else
                    description.push({ method: Reflect.get(this, key).toString().split("{")[0], data: "unknown" });
            return description;
        }
        hndEventUnbound(_event) {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    this.removeEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
                    this.node.removeEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    console.log("Module");
                    this.node.addEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
                    this.node.dispatchEvent(new CustomEvent(Script.EVENT.REGISTER_MODULE, { bubbles: true, detail: this }));
                    break;
            }
        }
    }
    Script.Module = Module;
})(Script || (Script = {}));
/// <reference path="Module.ts"/>
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION["STOP"] = "stop";
        DIRECTION["FORWARD"] = "forward";
        DIRECTION["BACK"] = "back";
        DIRECTION["LEFT"] = "left";
        DIRECTION["RIGHT"] = "right";
    })(DIRECTION = Script.DIRECTION || (Script.DIRECTION = {}));
    class Chassis extends Script.Module {
        constructor() {
            super(...arguments);
            this.speedWheel = 360; // angle to turn wheels in one second
            this.timeToMove = 1; // Seconds to perform a move to the next tile or a 90 degree turn
            this.#direction = DIRECTION.STOP;
            this.#left = [];
            this.#right = [];
            // protected reduceMutator(_mutator: ƒ.Mutator): void {
            //   // delete properties that should not be mutated
            //   // undefined properties and private fields (#) will not be included by default
            // }
        }
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(Chassis); }
        static { this.directions = new Map([
            [DIRECTION.FORWARD, [1, 1]], [DIRECTION.BACK, [-1, -1]], [DIRECTION.LEFT, [1, -1]], [DIRECTION.RIGHT, [-1, 1]], [DIRECTION.STOP, [0, 0]],
        ]); }
        #direction;
        #left;
        #right;
        getState() {
            const state = {
                position: this.node.mtxWorld.translation,
                rotation: this.node.mtxWorld.rotation,
            };
            return state;
        }
        async move(_direction) {
            this.#direction = _direction;
            const translation = _direction == DIRECTION.FORWARD ? 1 : _direction == DIRECTION.BACK ? -1 : 0;
            const rotation = 90 * (_direction == DIRECTION.LEFT ? 1 : _direction == DIRECTION.RIGHT ? -1 : 0);
            const promise = new Promise((_resolve) => {
                // let timer: ƒ.Timer = new ƒ.Timer()
                const fps = 25; // framerate for the movement of the chassis in frames per second
                const frames = this.timeToMove * fps; // number of frames for movement
                const hndTimer = (_event) => {
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
        hndEventUnbound(_event) {
            super.hndEventUnbound(_event);
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.#left = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelL"));
                    this.#right = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelR"));
                    break;
                case "renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */:
                    const timeElapsed = ƒ.Loop.timeFrameGame / 1000;
                    const left = timeElapsed * this.speedWheel * Chassis.directions.get(this.#direction)[0];
                    const right = timeElapsed * this.speedWheel * Chassis.directions.get(this.#direction)[1];
                    this.#left.forEach(_wheel => _wheel.mtxLocal.rotateX(left));
                    this.#right.forEach(_wheel => _wheel.mtxLocal.rotateX(right));
                    break;
            }
        }
        getDescription() {
            const description = [];
            description.push({ method: "move", data: "one of the following strings: forward, back, left, right, stop" });
            return description;
        }
    }
    Script.Chassis = Chassis;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let EVENT;
    (function (EVENT) {
        EVENT["MOVE"] = "move";
        EVENT["CONSOLIDATE"] = "consolidate";
        EVENT["REGISTER_MODULE"] = "registerModule";
    })(EVENT = Script.EVENT || (Script.EVENT = {}));
    class Droid extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(Droid); }
        #modules;
        constructor() {
            super();
            this.#modules = [];
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                        this.node.addEventListener(EVENT.MOVE, this.hndEvent);
                        this.node.addEventListener(EVENT.CONSOLIDATE, this.hndEvent);
                        this.node.addEventListener(EVENT.REGISTER_MODULE, this.hndEvent);
                        break;
                    case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                        this.removeEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
                        this.node.removeEventListener(EVENT.MOVE, this.hndEvent);
                        this.node.removeEventListener(EVENT.CONSOLIDATE, this.hndEvent);
                        this.node.removeEventListener(EVENT.REGISTER_MODULE, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                        console.log("Droid");
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        // this.node.broadcastEvent(new CustomEvent(EVENT.REGISTER_MODULE, { detail: this }))
                        break;
                    case EVENT.MOVE:
                        this.node.mtxLocal.translateZ(_event.detail.translation);
                        this.node.mtxLocal.rotateY(_event.detail.rotation);
                        break;
                    case EVENT.CONSOLIDATE:
                        this.node.mtxLocal.translation = this.node.mtxLocal.translation.map(_component => Math.round(_component));
                        this.node.mtxLocal.rotation = this.node.mtxLocal.rotation.map(_component => Math.round(_component));
                        break;
                    case EVENT.REGISTER_MODULE:
                        this.#modules.push(_event.detail);
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        getState() {
            const state = {};
            for (const module of this.#modules)
                state[module.constructor.name] = module.getState();
            return state;
        }
    }
    Script.Droid = Droid;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let getCommand = getCommandInternal;
    let droid;
    async function getAgents() {
        const url = "../../../Agent.js";
        // let url: string = "https://jirkadelloro.github.io/Agent/Agent.js"
        //@ts-expect-error import requires specific module configuration in tsconfig that is incompatible with outfile
        const agent = (await import(url)).default;
        await agent.createDialog(1, ["getCommand"]);
        getCommand = agent.get(0).getCommand;
    }
    async function start(_event) {
        await getAgents();
        viewport = _event.detail;
        const cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(-5);
        cmpCamera.mtxPivot.translateY(5);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        viewport.camera = cmpCamera;
        droid = viewport.getBranch().getChildrenByName("Droid")[0];
        // let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)
        const process = () => {
            ƒ.Render.prepare(droid);
            const state = droid.getComponent(Script.Droid).getState();
            const command = getCommand(state);
            const component = droid.getChildrenByName(command.module)[0].getComponent(Reflect.get(Script, command.module));
            const method = Reflect.get(component, command.method).bind(component);
            method(command.data).then(process);
        };
        process();
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function getCommandInternal(_state) {
        for (const module in _state)
            console.table(_state[module]);
        const data = Script.DIRECTION[ƒ.Random.default.getPropertyName(Script.DIRECTION)];
        const command = { module: "Chassis", method: "move", data: data };
        return command;
    }
    function update() {
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map