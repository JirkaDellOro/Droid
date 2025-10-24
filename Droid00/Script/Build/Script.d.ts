declare namespace Script {
    import ƒ = FudgeCore;
    interface State {
        [module: string]: Object;
    }
    interface Command {
        module: string;
        method: string;
        data?: unknown;
    }
    interface Description {
        method: string;
        data: string;
    }
    abstract class Module extends ƒ.ComponentScript {
        hndEvent: ƒ.EventListenerUnified;
        constructor();
        abstract getState(): object;
        logDescription(): Promise<void>;
        protected getDescription(): Description[];
        protected hndEventUnbound(_event: CustomEvent): void;
    }
}
declare namespace Script {
    enum DIRECTION {
        STOP = "stop",
        FORWARD = "forward",
        BACK = "back",
        LEFT = "left",
        RIGHT = "right"
    }
    class Chassis extends Module {
        #private;
        static readonly iSubclass: number;
        static readonly directions: Map<DIRECTION, number[]>;
        speedWheel: number;
        timeToMove: number;
        getState(): object;
        protected getDescription(): Description[];
        move(_direction: DIRECTION): Promise<void>;
        protected hndEventUnbound(_event: CustomEvent): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    enum EVENT {
        MOVE = "move",
        CONSOLIDATE = "consolidate",
        REGISTER_MODULE = "registerModule"
    }
    class Droid extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        constructor();
        getState(): object;
        hndEvent: (_event: CustomEvent) => void;
    }
}
declare namespace Script {
}
