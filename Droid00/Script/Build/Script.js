"use strict";
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
    class Chassis extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(Chassis); }
        static { this.directions = new Map([
            [DIRECTION.FORWARD, [1, 1]], [DIRECTION.BACK, [-1, -1]], [DIRECTION.LEFT, [1, -1]], [DIRECTION.RIGHT, [-1, 1]], [DIRECTION.STOP, [0, 0]],
        ]); }
        #left;
        #right;
        constructor() {
            super();
            this.speedWheel = 360; // angle to turn wheels in one second
            this.timeToMove = 1; // Seconds to perform a move to the next tile or a 90 degree turn
            this.direction = DIRECTION.STOP;
            this.#left = [];
            this.#right = [];
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
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
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        this.node.addEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
                        this.#left = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelL"));
                        this.#right = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelR"));
                        break;
                    case "renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */:
                        if (!this.direction)
                            return;
                        let timeElapsed = ƒ.Loop.timeFrameGame / 1000;
                        const left = timeElapsed * this.speedWheel * Chassis.directions.get(this.direction)[0];
                        const right = timeElapsed * this.speedWheel * Chassis.directions.get(this.direction)[1];
                        this.#left.forEach(_wheel => _wheel.mtxLocal.rotateX(left));
                        this.#right.forEach(_wheel => _wheel.mtxLocal.rotateX(right));
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
        async move(_direction) {
            this.direction = _direction;
            const translation = _direction == DIRECTION.FORWARD ? 1 : _direction == DIRECTION.BACK ? -1 : 0;
            const rotation = 90 * (_direction == DIRECTION.LEFT ? 1 : _direction == DIRECTION.RIGHT ? -1 : 0);
            let promise = new Promise((_resolve) => {
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
    }
    Script.Chassis = Chassis;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class Droid extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(Droid); }
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                        this.node.addEventListener("move", this.hndEvent);
                        this.node.addEventListener("consolidate", this.hndEvent);
                        break;
                    case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                        this.removeEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
                        this.node.removeEventListener("move", this.hndEvent);
                        this.node.removeEventListener("consolidate", this.hndEvent);
                        break;
                    case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                    case "move":
                        this.node.mtxLocal.translateZ(_event.detail.translation);
                        this.node.mtxLocal.rotateY(_event.detail.rotation);
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
    }
    Script.Droid = Droid;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        viewport = _event.detail;
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(-5);
        cmpCamera.mtxPivot.translateY(5);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        viewport.camera = cmpCamera;
        let droid = viewport.getBranch().getChildrenByName("Droid")[0];
        // let chassis: Chassis = droid.getChildrenByName("Chassis")[0].getComponent(Chassis)
        const process = () => {
            let command = getCommand({});
            let component = droid.getChildrenByName(command.module)[0].getComponent(Reflect.get(Script, command.module));
            let method = Reflect.get(component, command.method).bind(component);
            method(command.data).then(process);
        };
        process();
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function getCommand(_state) {
        let command = { module: "Chassis", method: "move", data: "forward" };
        return command;
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map