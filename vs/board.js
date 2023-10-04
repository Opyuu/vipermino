const piece_T = {
    NO_PIECE: 0,
    I: 1,
    O: 2,
    T: 3,
    L: 4,
    J: 5,
    S: 6,
    Z: 7,
    PIECE_NB: 8
};

const rotation_T = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3,
    ROTATION_NB: 4
}

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

class GameState{
    board = [];
    queue = [];
    heldPiece = 0;
    canHold = true;
    b2b = 0;
    activePiece = new ActivePiece(0, 0, 0, 0);
    pieceCount = 0;

    constructor() {
    }

    clearBoard(){
        for (let col = 0; col < 10; col++){
            this.board[col] = [];
            for (let row = 0; row < 40; row++){
                this.board[col][row] = new MinoInfo(piece_T.NO_PIECE, rotation_T.NORTH, 0);
            }
        }
    }

    occupied(x, y){
        return (this.board[x][y].type !== piece_T.NO_PIECE);
    }

    isValid(piece){
        let pc = pieceTable[piece.type][piece.rotation];

        for (let mino = 0; mino < 4; mino++){
            let x = piece.x + pc[mino].x;
            let y = piece.y + pc[mino].y;
            if (x < 0 || x > 9 || y < 0 || y > 39 || this.occupied(x, y)){
                return false;
            }
        }

        return true;
    }

    moveLeft(){
        this.activePiece.x--;

        if (!this.isValid(this.activePiece)){
            this.activePiece.x++;
            return false;
        }

        return true;
    }

    moveRight(){
        this.activePiece.x++;

        if (!this.isValid(this.activePiece)){
            this.activePiece.x--;
            return false;
        }

        return true;
    }

    moveDown(){
        this.activePiece.y--;

        if (!this.isValid(this.activePiece)){
            this.activePiece.y++;
            return false;
        }

        return true;
    }

    hardDrop(){
        this.placePiece(this.activePiece);

        this.pieceCount++;
        if (this.pieceCount % 7){
            this.sevenBag();
        }

        this.canHold = true;
        this.clearLines();
        this.spawnPiece();
    }

    hold(){
        if (!this.canHold) return;
        this.canHold = false;

        if (this.heldPiece === piece_T.NO_PIECE){
            this.heldPiece = this.activePiece.type;
            this.spawnPiece();
        } else{
            [this.heldPiece, this.activePiece.type] = [this.activePiece.type, this.heldPiece];
            this.activePiece.rotation = rotation_T.NORTH;
            this.activePiece.x = 4;
            this.activePiece.y = 21;
        }
    }

    testRotate(kickCoords){
        for (let kick = 0; kick < 5; kick++){
            let kickCoord = kickCoords[kick];
            this.activePiece.x += kickCoord.x;
            this.activePiece.y += kickCoord.y;

            if (this.isValid(this.activePiece)) return true;

            this.activePiece.x -= kickCoord.x;
            this.activePiece.y -= kickCoord.y;
        }
        return false;
    }

    rotateCW(){
        if (this.activePiece.type === piece_T.O) return true;

        let kickCoords = CW_KICKS[+(this.activePiece.type===piece_T.I)][this.activePiece.rotation];
        this.activePiece.rotation = (this.activePiece.rotation + 1) % 4;

        if (this.testRotate(kickCoords)) return true;

        this.activePiece.rotation = (this.activePiece.rotation + 3) % 4;
        return false;
    }

    rotateCCW(){
        if (this.activePiece.type === piece_T.O) return true;

        let kickCoords = CCW_KICKS[+(this.activePiece.type===piece_T.I)][this.activePiece.rotation];
        this.activePiece.rotation = (this.activePiece.rotation + 3) % 4;

        if (this.testRotate(kickCoords)) return true;

        this.activePiece.rotation = (this.activePiece.rotation + 1) % 4;
        return false;
    }

    clearLine(line){
        for (let col = 0; col < 10; col++){
            this.board[col][line] = new MinoInfo(0, 0, 0);
        }

        for (let row = line + 1; row < 40; row++){
            for (let col = 0; col < 10; col++){
                this.board[col][row-1] = this.board[col][row];
            }
        }
    }

    clearLines(){
        for (let row = 0; row < 40; row++){
            let line = true;
            for (let col = 0; col < 10; col++){
                if (this.board[col][row].type === 0){
                    line = false
                }
            }
            if (line){
                this.clearLine(row);
                row--;
            }
        }
    }

    printBoard(){
        for (let row = 39; row >= 0; row--){
            let line = "";
            for (let col = 0; col < 10; col++){
                line += this.board[col][row].type + " ";
            }

            console.log(line);
            console.log("\n");
        }
    }

    placePiece(piece){
        while (this.moveDown()){}

        let pc = pieceTable[piece.type][piece.rotation]

        for (let mino = 0; mino < 4; mino++){
            let x = piece.x + pc[mino].x;
            let y = piece.y + pc[mino].y;

            this.board[x][y] = new MinoInfo(piece.type, piece.rotation, mino);
        }
    }

    spawnPiece(){
        this.activePiece = new ActivePiece(this.queue[0], 0, 4, 21);
        this.queue.shift();
    }

    sevenBag(){
        let bag = [1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 7; i++){
            let index = Math.floor(Math.random() * bag.length);
            this.queue.push(bag[index]);
            bag.splice(index, 1);
        }
    }

    drawBoard(graphics){
        for (let row = 0; row < RENDER_ROWS; row++){
            for (let col = 0; col < COLS; col++){
                let minoType = this.board[col][row].type;
                if (minoType === piece_T.NO_PIECE) continue;

                let mino = this.board[col][row].mino;
                let rotation = this.board[col][row].rotation;

                let x = col;
                let y = RENDER_ROWS - row - 1;

                const transformationMatrix = new PIXI.Matrix();
                transformationMatrix.scale(1/32, 1/32);
                transformationMatrix.rotate( (Math.PI / 2) * rotation);
                graphics.beginTextureFill({
                    texture: CONNECTED_TEXTURES[minoType][mino],
                    matrix: transformationMatrix
                });
                graphics.drawRect(x, y, 1, 1);
                graphics.endFill();
            }
        }
    }

    drawActive(graphics){
        if (this.activePiece.type === piece_T.NO_PIECE) return;
        let pc = pieceTable[this.activePiece.type][this.activePiece.rotation];
        for (let mino = 0; mino < 4; mino++){
            let x = this.activePiece.x + pc[mino].x;
            let y = RENDER_ROWS - (this.activePiece.y + pc[mino].y) - 1;

            graphics.beginTextureFill({
                texture: PIECE_TEXTURE[this.activePiece.type],
                matrix: scalingMatrix
            });
            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }

    drawShadow(graphics){
        if(this.activePiece.type === piece_T.NO_PIECE) return;
        let ghost = new ActivePiece(this.activePiece.type, this.activePiece.rotation, this.activePiece.x, this.activePiece.y);

        while(this.isValid(ghost)){
            ghost.y--;
        }
        ghost.y++;

        let pc = pieceTable[ghost.type][ghost.rotation];
        for (let mino = 0; mino < 4; mino++){
            let x = ghost.x + pc[mino].x;
            let y = RENDER_ROWS - (ghost.y + pc[mino].y) - 1;

            graphics.beginTextureFill({
                texture: SHADOW_TEXTURE[ghost.type],
                matrix: scalingMatrix
            })
            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }

    drawQueue(graphics){
        let minoYPos = 1;
        for (let i = 0; i < 5; i++){
            let xoffset = this.queue[i] === 1 || this.queue[i] === 2 ? 2 : 2.5;
            let yoffset = this.queue[i] === 1 ? 0.5 : 1;

            let pc = pieceTable[this.queue[i]][0];
            for (let mino = 0; mino < 4; mino++){
                let x = pc[mino].x + xoffset;
                let y = minoYPos - pc[mino].y + yoffset;

                let translationMatrix = new PIXI.Matrix();
                translationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);
                translationMatrix.translate(xoffset - 2, yoffset);

                graphics.beginTextureFill({
                    texture: PIECE_TEXTURE[this.queue[i]],
                    matrix: translationMatrix
                });
                graphics.drawRect(x, y, 1, 1);
                graphics.endFill();

            }
            minoYPos += 3;
        }
    }

    drawHold(graphics){
        if (this.heldPiece === piece_T.NO_PIECE) return;

        let pieceType = this.canHold === true ? this.heldPiece : piece_T.PIECE_NB;

        const xoffset = this.heldPiece === 1 || this.heldPiece === 2 ? 2 : 2.5;
        const yoffset = this.heldPiece === 1 ? 0.5 : 1;

        let pc = pieceTable[this.heldPiece][0];
        for (let mino = 0; mino < 4; mino++){
            let x = pc[mino].x + xoffset;
            let y = 1 - pc[mino].y + yoffset;

            let translationMatrix = new PIXI.Matrix();
            translationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);
            translationMatrix.translate(xoffset - 2, yoffset);

            graphics.beginTextureFill({
                texture: PIECE_TEXTURE[pieceType],
                matrix: translationMatrix
            });
            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }
}