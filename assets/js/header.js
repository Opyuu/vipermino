class Coord {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class PRNG {
    s = 0;
    old = 0;
    constructor(seed) {
        this.s = seed;
    }

    rand(){
        this.old = this.s;
        this.s ^= (this.s >> 12);
        this.s ^= (this.s << 25);
        this.s ^= (this.s >> 27);
        return this.s * 2685821657736338717;
    }

    undo(){
        this.s = this.old;
        this.old = 0;
    }
}

const piece_T = {
    NO_PIECE: 0,
    I: 1,
    O: 2,
    T: 3,
    L: 4,
    J: 5,
    S: 6,
    Z: 7,
    GARBAGE: 8,
    PIECE_NB: 9
};

const rotation_T = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3,
    ROTATION_NB: 4
};

const tspin_T = {
    NONE: 0,
    MINI: 1,
    FULL: 2
};

class MinoInfo{
    constructor(type, rot, mino){
        this.type = type;
        this.rotation = rot;
        this.mino = mino;
    }
}

class ActivePiece{
    constructor(type, rot, x, y){
        this.type = type;
        this.rotation = rot;
        this.x = x;
        this.y = y;
    }
}

class TspinInfo{
    constructor() {
        this.rotated = false;
        this.kickFive = false;
    }
}
