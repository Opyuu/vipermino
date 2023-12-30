class TestPV{
    clearedRows = [];

    constructor(board) {
        this.testBoard = [];

        for (let row = 0; row < 10; row++){
            this.testBoard[row] = [];

            for (let col = 0; col < 40; col++){
                this.testBoard[row][col] = board[row][col].type;
            }
        }
    }
    clearRow(line){
        for (let row = line + 1; row < 40; row++){
            for (let col = 0; col < 10; col++){
                this.testBoard[col][row - 1] = this.testBoard[col][row];
            }
        }

        for (let col = 0; col < 10; col++){
            this.testBoard[col][39] = 0;
        }
    }

    clearLines(){
        for (let row = 0; row < 40; row++){
            let clear = 1;

            for (let col = 0; col < 10; col++){
                clear *= this.testBoard[col][row];
            }

            if (clear) {
                this.clearRow(row);
                this.clearedRows.push(row);
                row--;
            }
        }
    }

    playMove(move){
        let piece = move.piece;
        let x = move.x;
        let y = move.y;
        let rot = move.rotation;

        let pc = pieceTable[piece][rot];

        for (let mino = 0; mino < 4; mino++){
            let xpos = x + pc[mino].x;
            let ypos = y + pc[mino].y;
            this.testBoard[xpos][ypos] = piece;
        }

        this.clearLines();
    }
}

class Bot{
    pieceCount = 0;
    tspinInfo = new TspinInfo();

    constructor(app, queueSeed, garbSeed, worker) {
        this.worker = worker;
        this.state = new GameState(queueSeed, garbSeed);
        this.app = app;

        this.boardGraphics = new PIXI.Graphics();
        this.borderGraphics = new PIXI.Graphics(); // Includes grid etc, is drawn at the very back
        this.activeGraphics = new PIXI.Graphics();
        this.queueGraphics = new PIXI.Graphics();
        this.holdGraphics = new PIXI.Graphics();
        this.garbageGraphics = new PIXI.Graphics();
        this.pvGraphics = new PIXI.Graphics();
        this.statsText = new PIXI.Text();
    }

    garbageIn(lines){
        this.state.garbageIn(lines);
        drawGarbage(this);
    }

    hold(){
        this.state.hold();
        playerSounds["hold"].play()
        drawHold(this);
        drawQueue(this);
    }

    movePiece(move, spin){
        this.state.activePiece.x = move.x;
        this.state.activePiece.y = move.y;
        this.state.activePiece.rotation = move.rotation;

        if (spin !== 0) {
            this.tspinInfo.rotated = true;
            if (spin === 1) this.tspinInfo.kickFive = true;
            playerSounds["spin"].play();
        } else{
            this.tspinInfo.rotated = false;
            this.tspinInfo.kickFive = false;
        }


        drawActive(this, false);
    }

    place(){
        this.pieceCount++;
        this.state.stats.pieceCount++;
        this.state.placePiece(this.state.activePiece);

        if (this.pieceCount % 7 === 0){
            let q = this.state.sevenBag();

            this.worker.postMessage({type: 'newpiece', piece: q});
        }

        playerSounds["hardDrop"].play();
        drawBoard(this);
        drawActive(this, false);
    }

    drawPV(pv){
        this.app.stage.removeChild(this.pvGraphics);
        this.pvGraphics.clear();

        let testObj = new TestPV(this.state.board);

        let pieceCount = 0;
        let currentAlpha = 1;
        // let alphaChange = 0.8/pv.length;

        for (let move of pv){
            let piece = move.piece;
            let x = move.x;
            let y = move.y;
            let rot = move.rotation;
            // Draw shadow

            let pc = pieceTable[piece][rot];

            for (let mino = 0; mino < 4; mino++){
                let xpos = x + pc[mino].x;
                let ypos = y + pc[mino].y;

                testObj.clearedRows.findLast(r => {
                    if (ypos >= r) ypos++
                });

                ypos = RENDER_ROWS - ypos - 1;

                const transformationMatrix = new PIXI.Matrix();
                transformationMatrix.scale(1 / BLOCK_SIZE, 1/BLOCK_SIZE);
                transformationMatrix.rotate( (Math.PI / 2) * rot);

                this.pvGraphics.beginTextureFill({
                    texture: PV_TEXTURE[piece][mino],
                    matrix: transformationMatrix,
                    alpha: currentAlpha
                });
                this.pvGraphics.drawRect(xpos, ypos, 1, 1);
                this.pvGraphics.endFill();
            }
            testObj.playMove(move);
            if (pieceCount === 3) currentAlpha = 0.4;
            // currentAlpha -= alphaChange;
            pieceCount++;
        }

        this.app.stage.addChild(this.pvGraphics);
    }

    clearLines(){
        if (!this.state.clearLines(this.tspinInfo)) this.state.tankGarbage(true);
        this.state.spawnPiece(); // Spawn always happens after clear
        drawGarbage(this);


        if (!this.state.isValid(this.state.activePiece)){
            let temp = this.state.activePiece.type;
            this.state.activePiece.type = piece_T.NO_PIECE;
            drawActive(this, false);

            this.state.gameOver();
            drawBoard(this);
            this.state.activePiece.type = temp;
        } else {
            drawBoard(this);
            drawQueue(this);
            drawActive(this, false);
        }
    }

    encodeQueue(){
        let queue = "";
        for (let i = 0; i < this.state.queue.length; i++){
            queue += PIECE_CHAR[this.state.queue[i]];
        }
        return queue;
    }


    // <----------- DRAWING FUNCTIONS ------------>
    init(){
        this.boardGraphics.position.set(7 * BLOCK_SIZE, 0);
        this.boardGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.borderGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.activeGraphics.position.set(7 * BLOCK_SIZE, 0);
        this.activeGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.queueGraphics.position.set((6 + COLS + 1) * BLOCK_SIZE, 4 * BLOCK_SIZE);
        this.queueGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.holdGraphics.position.set(0, 4 * BLOCK_SIZE);
        this.holdGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);

        this.garbageGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.garbageGraphics.position.set(6 * BLOCK_SIZE, 0);
        this.pvGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.pvGraphics.position.set(7 * BLOCK_SIZE, 0);
    }

    destroy(){
        this.boardGraphics.clear();
        this.borderGraphics.clear();
        this.activeGraphics.clear();
        this.queueGraphics.clear();
        this.holdGraphics.clear();
        this.garbageGraphics.clear();
        this.pvGraphics.clear();

        this.app.stage.removeChild(this.boardGraphics);
        this.app.stage.removeChild(this.borderGraphics);
        this.app.stage.removeChild(this.activeGraphics);
        this.app.stage.removeChild(this.queueGraphics);
        this.app.stage.removeChild(this.holdGraphics);
        this.app.stage.removeChild(this.garbageGraphics);
        this.app.stage.removeChild(this.statsText);
        this.app.stage.removeChild(this.pvGraphics);
    }
}