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

class GameState{
    board = [];
    queue = [];
    heldPiece = 0;
    canHold = true;
    b2b = -1;
    combo = -1;
    activePiece = new ActivePiece(0, 0, 0, 0);
    pieceCount = 0;
    garbage = [];
    outgoingGarbage= [];
    tspinCheck = new TspinInfo();

    shuffler;
    garbShuffler;
    bot = false;


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

    isEmpty(){
        for (let col = 0; col < 10; col++){
            for (let row = 0; row < 40; row++){
                if (this.board[col][row].type !== piece_T.NO_PIECE) return false;
            }
        }
        return true;
    }

    occupied(x, y){
        return (x < 0 || x > 9 || y < 0 || y > 39 || this.board[x][y].type !== piece_T.NO_PIECE);
    }

    isValid(piece){
        let pc = pieceTable[piece.type][piece.rotation];

        for (let mino = 0; mino < 4; mino++){
            let x = piece.x + pc[mino].x;
            let y = piece.y + pc[mino].y;
            if (this.occupied(x, y)){
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
        this.tspinCheck.rotated = false;
        return true;
    }

    moveRight(){
        this.activePiece.x++;

        if (!this.isValid(this.activePiece)){
            this.activePiece.x--;
            return false;
        }
        this.tspinCheck.rotated = false;
        return true;
    }

    moveDown(){
        this.activePiece.y--;

        if (!this.isValid(this.activePiece)){
            this.activePiece.y++;
            return false;
        }
        this.tspinCheck.rotated = false;
        return true;
    }

    hardDrop(){
        let queue = "";
        this.placePiece(this.activePiece);

        this.pieceCount++;
        if (this.pieceCount % 7 === 0){
            queue = this.sevenBag();
        }

        this.canHold = true;
        if (!this.clearLines()) this.tankGarbage();
        this.spawnPiece();
        return queue;
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
        let kick = 0
        for (let kickCoord of kickCoords){
            this.activePiece.x += kickCoord.x;
            this.activePiece.y += kickCoord.y;

            if (this.isValid(this.activePiece)) {
                this.tspinCheck.kickFive = kick === 4;
                this.tspinCheck.rotated = true;
                return true;
            }

            this.activePiece.x -= kickCoord.x;
            this.activePiece.y -= kickCoord.y;
            kick++;
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

    rotate180(){
        if (this.activePiece.type === piece_T.O) return true;

        let kickCoords = KICKS_180[+(this.activePiece.type===piece_T.I)][this.activePiece.rotation];

        this.activePiece.rotation = (this.activePiece.rotation + 2) % 4;

        if (this.testRotate(kickCoords)) return true;

        this.activePiece.rotation = (this.activePiece.rotation + 2) % 4;
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

        for (let col = 0; col < 10; col++){
            this.board[col][39] = new MinoInfo(0, 0, 0);  // Avoid leaking from top
        }
    }

    clearLines(){
        let clear = false
        let lineCount = 0

        // Tspin checking
        let tspin = tspin_T.NONE;
        if (this.activePiece.type === piece_T.T && this.tspinCheck.rotated === true) {
            let out = 0;
            let inc = 0;

            for (let mino = 0; mino < 2; mino++) { // Out corners, for "mini"
                const x = this.activePiece.x + outCorners[this.activePiece.rotation][mino].x;
                const y = this.activePiece.y + outCorners[this.activePiece.rotation][mino].y;

                out += +(this.occupied(x, y));
            }

            for (let mino = 0; mino < 2; mino++){ // In corners, for "full"
                const x = this.activePiece.x + inCorners[this.activePiece.rotation][mino].x;
                const y = this.activePiece.y + inCorners[this.activePiece.rotation][mino].y;

                inc += +(this.occupied(x, y));
            }

            if (out + inc >= 3){
                if (inc >= 2){
                    tspin = tspin_T.FULL;
                } else{
                    tspin = tspin_T.MINI;
                }
            }

            if (this.tspinCheck.kickFive === true){
                tspin = tspin_T.FULL;
            }
        }

        for (let row = 0; row < 40; row++){
            let line = true;
            for (let col = 0; col < 10; col++){
                if (this.board[col][row].type === piece_T.NO_PIECE){
                    line = false
                }
            }
            if (line){
                lineCount++;
                clear = true;
                this.clearLine(row);
                row--;
            }
        }

        if (lineCount === 0) {
            this.combo = -1;  // Reset combo
        } else{
            this.combo++;
        }

        if ((tspin === tspin_T.FULL && clear) || lineCount === 4) {
            this.b2b++;
        }
        else if (clear){
            this.b2b = -1;
        }

        let lines = this.calcLines(lineCount, this.combo, tspin);

        this.sendGarbage(lines);

        if (this.isEmpty()) this.sendGarbage(10); // PC!
        
        return clear;
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

    spawnGarbage(count){
        let column = this.garbShuffler.rand() % 10;

        if (this.bot) worker.postMessage({type: 'garbage', lines: count, col: column});

        for (let i = 0; i < count; i++){
            for(let row = 39; row > 0; row--){
                for (let col = 0; col < 10; col++) {
                    this.board[col][row] = this.board[col][row - 1];
                }
            }

            for (let col = 0; col < 10; col++){
                if (col === column) this.board[col][0] = new MinoInfo(0, 0, 0);
                else this.board[col][0] = new MinoInfo(piece_T.GARBAGE, 0, 0);
            }
        }
    }

    tankGarbage(){
        let undo = false;
        let totalSpawn = 0;
        while (totalSpawn < 8 && this.garbage.length !== 0){
            let i = this.garbage[0];

            totalSpawn += i;

            if (totalSpawn > 8){ // Garbage cap
                let excess = totalSpawn - 8;
                this.garbage[0] = excess;
                i -= excess;

                undo = true; // Spawn counter (for rng) is reset so that the next group of garbage spawns at same column
            }
            else{
                this.garbage.shift();
            }
            this.spawnGarbage(i);
        }
        if (undo) this.garbShuffler.undo();
    }

    garbageIn(lines){
        this.garbage.push(lines);
    }

    sendGarbage(lines){
        if (lines === 0) return;

        // Cancel all possible in garbage, then push any remaining sent lines
        if (this.garbage === []) {
            this.outgoingGarbage.push(lines); // No cancelling
        }
        else{
            for (let i = 0; i < this.garbage.length; i++){
                let temp = this.garbage[i];
                this.garbage[i] -= lines;
                lines -= temp;
            }

            for (let i = 0; i < this.garbage.length; i++){
                this.garbage[i] = Math.max(0, this.garbage[i]);
            }

            lines = Math.max(0, lines);
            this.outgoingGarbage.push(lines);
        }


    }

    calcLines(lines, combo, tspin){
        return ATTACK_TABLE[tspin][lines];
    }

    sevenBag(){
        let bag = [1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 7; i++){
            let j = this.shuffler.rand() % (i + 1);
            [bag[j], bag[i]] = [bag[i], bag[j]];
        }
        let queue = "";

        for (let i = 0; i < 7; i++){
            this.queue.push(bag[i]);
            queue += PIECE_CHAR[bag[i]];
        }
        return queue;
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

            const transformationMatrix = new PIXI.Matrix();
            transformationMatrix.scale(1/32, 1/32);
            transformationMatrix.rotate( (Math.PI / 2) * this.activePiece.rotation);

            graphics.beginTextureFill({
                texture: CONNECTED_TEXTURES[this.activePiece.type][mino],
                matrix: transformationMatrix
            });

            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }

    drawShadow(graphics){
        if(this.activePiece.type === piece_T.NO_PIECE) return;
        let ghost = new ActivePiece(this.activePiece.type, this.activePiece.rotation, this.activePiece.x, this.activePiece.y - 1);

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
                    texture: CONNECTED_TEXTURES[this.queue[i]][mino],
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

        let pieceType = this.canHold === true ? this.heldPiece : piece_T.GARBAGE;

        const xoffset = this.heldPiece === 1 || this.heldPiece === 2 ? 2 : 2.5;
        const yoffset = this.heldPiece === 1 ? 0.5 : 1;

        let pc = pieceTable[this.heldPiece][0];
        for (let mino = 0; mino < 4; mino++){
            let x = pc[mino].x + xoffset;
            let y = 1 - pc[mino].y + yoffset;

            let translationMatrix = new PIXI.Matrix();
            translationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);
            translationMatrix.translate(xoffset - 2, yoffset);


            if (pieceType === piece_T.GARBAGE){
                graphics.beginTextureFill({
                    texture: PIECE_TEXTURE[pieceType],
                    matrix: translationMatrix
                });
            } else {
                graphics.beginTextureFill({
                    texture: CONNECTED_TEXTURES[pieceType][mino],
                    matrix: translationMatrix
                });
            }
            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }

    drawGarbage(graphics){
        const offset = (BORDER_SIZE/BLOCK_SIZE) / 2;
        let garbageSum = 0;

        for (let i of this.garbage){
            garbageSum += i;
        }

        if (garbageSum === 0) return;

        const ypos = Math.max(25 - garbageSum - 1, 0);
        const length = Math.min(garbageSum ,24);

        graphics.beginFill(0xFF0000);
        graphics.drawRect(offset, ypos, 1 - 3*offset, length);
        graphics.endFill();

        graphics.lineStyle((BORDER_SIZE/BLOCK_SIZE) / 2, 0xFFFFFF)
        let total = 0;

        for (let i of this.garbage){
            total += i;
            let ypos = 24 - total;

            graphics.moveTo(offset, ypos);
            graphics.lineTo(1 - 2*offset, ypos);
        }

        // Garbage cap indicator
        graphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, GRID_COLOUR);
        graphics.moveTo(offset, 24 - 8);
        graphics.lineTo(1 - 2*offset, 24 - 8);

        graphics.endFill();
    }

    // WASM Comm functions

    movePiece(pieceInfo){
        this.activePiece.x = pieceInfo.x;
        this.activePiece.y = pieceInfo.y;
        this.activePiece.rotation = pieceInfo.rotation;

        if (this.activePiece.type !== pieceInfo.piece) console.warn("Piece error!");

        this.activePiece.type = pieceInfo.piece;
    }

    toFumen(){

    }

    encodeQueue(){
        let queue = "";
        for (let i = 0; i < this.queue.length; i++){
            queue += PIECE_CHAR[this.queue[i]];
        }
        return queue;
    }
}