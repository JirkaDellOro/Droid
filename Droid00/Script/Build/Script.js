"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["STOP"] = 0] = "STOP";
        DIRECTION[DIRECTION["FORWARD"] = 1] = "FORWARD";
        DIRECTION[DIRECTION["BACK"] = 2] = "BACK";
        DIRECTION[DIRECTION["LEFT"] = 3] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 4] = "RIGHT";
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
                        ƒ.Loop.removeEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.hndEvent);
                        this.#left = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelL"));
                        this.#right = this.node.getChildren().filter((_node) => _node.name.startsWith("WheelR"));
                        break;
                    case "loopFrame" /* ƒ.EVENT.LOOP_FRAME */:
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
                    console.log(_event.count);
                    this.node.mtxLocal.translateZ(translation / frames);
                    this.node.mtxLocal.rotateY(rotation / frames);
                    if (_event.lastCall)
                        _resolve();
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
    ƒ.Debug.info("Main Program Template running!");
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
        let chassis = droid.getChildrenByName("Chassis")[0].getComponent(Script.Chassis);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        await chassis.move(Script.DIRECTION.FORWARD);
        await chassis.move(Script.DIRECTION.LEFT);
        await chassis.move(Script.DIRECTION.FORWARD);
        await chassis.move(Script.DIRECTION.LEFT);
        await chassis.move(Script.DIRECTION.FORWARD);
        await chassis.move(Script.DIRECTION.LEFT);
        await chassis.move(Script.DIRECTION.FORWARD);
        await chassis.move(Script.DIRECTION.LEFT);
        await chassis.move(Script.DIRECTION.STOP);
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map