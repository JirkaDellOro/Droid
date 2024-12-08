declare namespace Script {
    import ƒ = FudgeCore;
    enum DIRECTION {
        STOP = 0,
        FORWARD = 1,
        BACK = 2,
        LEFT = 3,
        RIGHT = 4
    }
    class Chassis extends ƒ.ComponentScript {
        #private;
        static readonly iSubclass: number;
        static readonly directions: Map<DIRECTION, number[]>;
        speedWheel: number;
        timeToMove: number;
        direction: DIRECTION;
        constructor();
        move(_direction: DIRECTION): Promise<void>;
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Droid extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: CustomEvent) => void;
    }
}
declare namespace Script {
}
