let pieceTable = []; // [Piece][Rotation][Mino #] of Coord class




function cells(piece){ // Returns an array of cell location: [mino][x/y]
    switch(piece){
        case 1: // I piece
            return [new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord( 2, 0)];
        case 2: // O piece
            return [new Coord( 0, 0), new Coord(1, 0), new Coord(0, 1), new Coord( 1, 1)];
        case 3: // T piece
            return [new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord( 0, 1)];
        case 4: // L piece
            return [new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord( 1, 1)];
        case 5: // J piece
            return [new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord(-1, 1)];
        case 6: // S piece
            return [new Coord(-1, 0), new Coord(0, 0), new Coord(0, 1), new Coord( 1, 1)];
        case 7: // Z piece
            return [new Coord(-1, 1), new Coord(0, 1), new Coord(0, 0), new Coord( 1, 0)];
        default: // Shouldn't happen
            return [new Coord( 0, 0), new Coord(0, 0), new Coord(0, 0), new Coord( 0, 0)];
    }
}


// Rotates a specific mino relative to the centre
function rotate_cell(rotation, coords){ // Returns Coord class
    switch(rotation){
        case 0: // NORTH
            return coords;
        case 1: // EAST
            return new Coord(coords.y, -coords.x);
        case 2: // SOUTH
            return new Coord(-coords.x, -coords.y);
        case 3: // WEST
            return new Coord(-coords.y, coords.x);
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

let outCorners = [
    [new Coord(-1, -1), new Coord(1, -1)]
]; // [Rotation][Corner #] of Coord

let inCorners = [
    [new Coord(1, 1), new Coord(-1, 1)]
];

function init_piece(){
    for (let i = 0; i < 8; i++){
        pieceTable[i] = [];
    }

    for(let piece = 0; piece < 8; piece++){
        for (let rotation = 0; rotation < 4; rotation++){
            pieceTable[piece][rotation] = rotate_cells(rotation, cells(piece));
        }
    }

    for (let rotation = 1; rotation < 4; rotation++){
        outCorners[rotation] = [];
        for (let mino = 0; mino < 2; mino++){
            outCorners[rotation][mino] = rotate_cell(rotation, outCorners[0][mino]);
        }
    }

    for (let rotation = 1; rotation < 4; rotation++){
        inCorners[rotation] = [];
        for (let mino = 0; mino < 2; mino++){
            inCorners[rotation][mino] = rotate_cell(rotation, inCorners[0][mino]);
        }
    }
}

init_piece();
