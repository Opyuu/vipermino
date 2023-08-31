// stuff related to piece coords

// enum Piece{
//     NO_PIECE, I, O, T, L, J, S, Z, PIECE_NB = 8
// };

// Piece offset, for default orientation

class coord{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class rotation{
    NORTH = 0;
    EAST = 1;
    SOUTH = 2;
    WEST = 3;
}

let pieceTable = []; // [Piece][Rotation][Mino #] of coord class

function cells(piece){ // Returns an array of cell location: [mino][x/y]
    switch(piece){
        case 1: // I piece
            return [new coord(-1, 0), new coord(0, 0), new coord(1, 0), new coord( 2, 0)];
        case 2: // O piece
            return [new coord( 0, 0), new coord(1, 0), new coord(0, 1), new coord( 1, 1)];
        case 3: // T piece
            return [new coord(-1, 0), new coord(0, 0), new coord(1, 0), new coord( 0, 1)];
        case 4: // L piece
            return [new coord(-1, 0), new coord(0, 0), new coord(1, 0), new coord( 1, 1)];
        case 5: // J piece
            return [new coord(-1, 0), new coord(0, 0), new coord(1, 0), new coord(-1, 1)];
        case 6: // S piece
            return [new coord(-1, 0), new coord(0, 0), new coord(0, 1), new coord( 1, 1)];
        case 7: // Z piece
            return [new coord(-1, 1), new coord(0, 1), new coord(0, 0), new coord( 1, 0)];
        default: // Shouldn't happen
            return [new coord( 0, 0), new coord(0, 0), new coord(0, 0), new coord( 0, 0)];
    }
}

// Rotates a specific mino relative to the centre
function rotate_cell(rotation, coords){ // Returns coord class
    switch(rotation){
        case 0: // NORTH
            return coords;
        case 1: // EAST
            return new coord(coords.y, -coords.x);
        case 2: // SOUTH
            return new coord(-coords.x, -coords.y);
        case 3: // WEST
            return new coord(-coords.y, coords.x);
    }
}

function rotate_cells(rotation, pieceCoords){ // Piececoords as array of coords. Returns the same structure.
    return [
        rotate_cell(rotation, pieceCoords[0]),
        rotate_cell(rotation, pieceCoords[1]),
        rotate_cell(rotation, pieceCoords[2]),
        rotate_cell(rotation, pieceCoords[3])
    ];
}

function init_piece(){
    for (let i = 0; i < 8; i++){
        pieceTable[i] = [];
    }

    for(let piece = 0; piece < 8; piece++){
        for (let rotation = 0; rotation < 4; rotation++){
            pieceTable[piece][rotation] = rotate_cells(rotation, cells(piece));
        }
    }
}

init_piece();

// console.log(pieceTable[1][0][0].x); // X-coord of first mino of initial rotation of i piece :sob:
                // [Piece][Rot][Mino][X/Y]