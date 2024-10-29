function tetrioDamcalc(clear, tspin, combo, b2b){
    combo += 1;
    b2b += 1;
    let lines = 0;

    // Base damage
    switch(clear){
        case 0:
            lines += 0;
            break;

        case 1:
            if (tspin === tspin_T.MINI){
                lines += tetrioAttackTable.TSPIN_MINI_SINGLE;
            } else if (tspin === tspin_T.FULL){
                lines += tetrioAttackTable.TSPIN_SINGLE;
            } else{
                lines += tetrioAttackTable.SINGLE;
            }
            break;

        case 2:
            if (tspin === tspin_T.MINI){
                lines += tetrioAttackTable.TSPIN_MINI_DOUBLE;
            } else if (tspin === tspin_T.FULL){
                lines += tetrioAttackTable.TSPIN_DOUBLE;
            } else{
                lines += tetrioAttackTable.DOUBLE;
            }
            break;

        case 3:
            if (tspin === tspin_T.FULL){
                lines += tetrioAttackTable.TSPIN_TRIPLE;
            } else{
                lines += tetrioAttackTable.TRIPLE;
            }
            break;

        case 4:
            if (tspin === tspin_T.FULL){
                lines += tetrioAttackTable.TSPIN_QUAD;
            } else{
                lines += tetrioAttackTable.QUAD;
            }
            break;

    }

    if (clear > 0 && b2b > 1){
        const a = tetrioAttackTable.BACKTOBACK_BONUS *
            (Math.floor(1 + Math.log1p(
                (b2b - 1) * tetrioAttackTable.BACKTOBACK_BONUS_LOG)) +
                   ( (b2b - 1 === 1)
                    ? 0
                    : (1 + Math.log1p((b2b - 1) * tetrioAttackTable.BACKTOBACK_BONUS_LOG) % 1) / 3)
            );

        lines += a;
    }

    if (combo > 1){
        lines *= (1 + tetrioAttackTable.COMBO_BONUS * (combo - 1));
    }
    if (combo > 2){
        lines = Math.max(
            Math.log1p(tetrioAttackTable.COMBO_MINIFIER * (combo - 1) * tetrioAttackTable.COMBO_MINIFIER_LOG),
            lines
        );
    }

    return Math.floor(lines);
}

class GameState{
    board = [];
    queue = [];
    garbageQueue = [];
    outgoingGarbage = [];
    pow = false;
    b2b = -1;
    combo = -1;

    heldPiece = piece_T.NO_PIECE;
    activePiece;

    bagSeedPRNG;
    garbageSeedPRNG;

    stats = new Statistics();

    constructor(bagSeed, garbageSeed){
        this.bagSeedPRNG = new PRNG(bagSeed);
        this.garbageSeedPRNG = new PRNG(garbageSeed);
    }

    clearBoard(){
        for (let col = 0; col < 10; col++){
            this.board[col] = [];

            for (let row = 0; row < 40; row++){
                this.board[col][row] = new MinoInfo(piece_T.NO_PIECE, rotation_T.NORTH, 0);
            }
        }
    }

    gameOver(){
        for (let col = 0; col < 10; col++){
            for (let row = 0; row < 40; row++){
                if (this.board[col][row].type !== piece_T.NO_PIECE){
                    this.board[col][row].type = piece_T.GARBAGE;
                    this.board[col][row].mino = 0;
                    this.board[col][row].rotation = 0;
                }
            }
        }
    }

    isEmpty(){
        for (let col = 0; col < 10; col++){
            for (let row = 0; row < 40; row++){
                if (this.board[col][row].type !== piece_T.NO_PIECE){
                    return false;
                }
            }
        }
        return true;
    }

    occupied(x, y){
        return (x < 0 || x > 9 || y < 0 || y > 39 || this.board[x][y].type !== piece_T.NO_PIECE);
    }

    isValid(piece){ // Checks validity of a piece in a particular location
        if (piece.type === piece_T.NO_PIECE) return false;
        let pc = pieceTable[piece.type][piece.rotation];

        for (let mino = 0; mino < 4; mino++){
            let x = piece.x + pc[mino].x;
            let y = piece.y + pc[mino].y;

            if (this.occupied(x, y)) return false;
        }

        return true;
    }

    clearLine(line){
        let garbCount = 0;
        for (let col = 0; col < 10; col++){
            if (this.board[col][line].type === piece_T.GARBAGE) garbCount++;
            this.board[col][line] = new MinoInfo(piece_T.NO_PIECE, rotation_T.NORTH, 0);
        }

        if (garbCount === 9) this.stats.garbageCleared++;

        for (let row = line + 1; row < 40; row++){
            for (let col = 0; col < 10; col++){
                this.board[col][row - 1] = this.board[col][row];
            }
        }

        for (let col = 0; col < 10; col++){
            this.board[col][39] = new MinoInfo(piece_T.NO_PIECE, rotation_T.NORTH, 0); // Avoids leaking from top
        }
    }

    checkTspin(tspinInfo){
        let tspin = tspin_T.NONE;
        if (this.activePiece.type === piece_T.T && tspinInfo.rotated === true){
            let out = 0; // Out facing corners, 3 corner rule
            let inc = 0; // In facing corners, 2 corner rule

            for (let mino = 0; mino < 2; mino++){
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

                if (tspinInfo.kickFive === true){
                    tspin = tspin_T.FULL;
                }
            }
        }

        return tspin;
    }

    clearLines(tspinInfo){
        let clear = false;
        let lineCount = 0;

        let tspin = this.checkTspin(tspinInfo);

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

        if ((tspin === tspin_T.FULL && clear) || (tspin === tspin.MINI && clear) || lineCount === 4) {
            this.b2b++;
        }
        else if (clear){
            if (this.b2b > 2) playerSounds["b2bbreak"].play();

            this.b2b = -1;
        }

        if (lineCount === 0) {
            if (this.combo > 1){
                playerSounds[`combobreak`].play();
            }

            this.pow = false;
            this.combo = -1;  // Reset combo

        } else{
            this.combo++;
            if (this.combo > 0) {
                let lines = tetrioDamcalc(lineCount, tspin, this.combo, this.b2b);

                if (lines > 5) {
                    this.pow = true;
                }
                playerSounds[`${this.combo > 16 ? 16 : this.combo}combo${this.pow === true ? "_power" : ""}`].play();
            }

            if (tspin !== tspin_T.NONE) playerSounds["clearSpin"].play();
            else if (this.b2b > 0) playerSounds["clearb2b"].play();
            else if (lineCount === 4) playerSounds["clearQuad"].play();
            else playerSounds["0combo"].play();
        }

        let lines = tetrioDamcalc(lineCount, tspin, this.combo, this.b2b);
        this.sendGarbage(lines);

        if (this.isEmpty()) {
            this.sendGarbage(10);
            playerSounds["allClear"].play();
        }

        return clear;
    }


    hold(){
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

    placePiece(piece) {
        let pc = pieceTable[piece.type][piece.rotation];

        for (let i = 0; i < 4; i++) {
            let x = piece.x + pc[i].x;
            let y = piece.y + pc[i].y;
            this.board[x][y] = new MinoInfo(piece.type, piece.rotation, i);
        }
    }

    spawnPiece(){
        this.activePiece = new ActivePiece(this.queue[0], 0, 4, 21);
        this.queue.shift();
    }

    spawnGarbage(count, bot=false){
        let column = this.garbageSeedPRNG.rand() % 10;

        if (bot) worker.postMessage({type: 'garbage', lines: count, col: column});

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

    tankGarbage(bot=false){
        let undo = false;
        let total = 0;

        while(total < 8 && this.garbageQueue.length !== 0){
            let i = this.garbageQueue[0];

            total += i;

            if (total > 8){
                let excess = total - 8;
                this.garbageQueue[0] = excess;
                i -= excess;

                undo = true;
            } else{
                this.garbageQueue.shift();
            }
            this.spawnGarbage(i, bot);
        }

        if (total > 0){
            // play tank
            playerSounds["garbageRise"].play();
        }

        if (undo) this.garbageSeedPRNG.undo();
    }

    garbageIn(lines){
        this.garbageQueue.push(lines);
    }

    sendGarbage(lines){
        this.stats.attack += lines;
        if (lines === 0) return;

        if (this.garbageQueue.length === 0){
            this.outgoingGarbage.push(lines);
        } else{
            for (let i = 0; i < this.garbageQueue.length; i++){
                let temp = this.garbageQueue[i];
                this.garbageQueue[i] -= lines;
                lines -= temp;
                if (lines <= 0) break;
            }

            for (let i = 0; i < this.garbageQueue.length; i++){
                this.garbageQueue[i] = Math.max(0, this.garbageQueue[i]);
            }

            lines = Math.max(0, lines);
            this.outgoingGarbage.push(lines);
        }
    }

    sevenBag(){
        const bag = [1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 7; i++){
            let j = this.bagSeedPRNG.rand() % (i + 1);
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        let queue = "";

        for (let i = 0; i < 7; i++){
            queue += PIECE_CHAR[bag[i]];
            this.queue.push(bag[i]);
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
                transformationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);
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

    drawHold(graphics, canHold=true){
        if (this.heldPiece === piece_T.NO_PIECE) return;

        let pieceType = canHold === true ? this.heldPiece : piece_T.GARBAGE;

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

        for (let i of this.garbageQueue){
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

        for (let i of this.garbageQueue){
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

    drawActive(graphics) {
        if (this.activePiece.type === piece_T.NO_PIECE) return;
        let pc = pieceTable[this.activePiece.type][this.activePiece.rotation];
        for (let mino = 0; mino < 4; mino++) {
            let x = this.activePiece.x + pc[mino].x;
            let y = RENDER_ROWS - (this.activePiece.y + pc[mino].y) - 1;

            const transformationMatrix = new PIXI.Matrix();
            transformationMatrix.scale(1 / BLOCK_SIZE, 1 / BLOCK_SIZE);
            transformationMatrix.rotate((Math.PI / 2) * this.activePiece.rotation);

            graphics.beginTextureFill({
                texture: CONNECTED_TEXTURES[this.activePiece.type][mino],
                matrix: transformationMatrix
            });

            graphics.drawRect(x, y, 1, 1);
            graphics.endFill();
        }
    }

    drawShadow(graphics) {
        if (this.activePiece.type === piece_T.NO_PIECE) return;
        let ghost = new ActivePiece(this.activePiece.type, this.activePiece.rotation, this.activePiece.x, this.activePiece.y - 1);

        while (this.isValid(ghost)) {
            ghost.y--;
        }
        ghost.y++;

        let pc = pieceTable[ghost.type][ghost.rotation];
        for (let mino = 0; mino < 4; mino++) {
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
}