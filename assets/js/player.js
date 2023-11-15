class Player{
    state;
    tspinCheck = new TspinInfo();

    gameOver = false;

    pieceCount = 0;

    canHold = true;

    constructor(app, queueSeed, garbSeed){
        this.state = new GameState(queueSeed, garbSeed);
        this.app = app;

        this.boardGraphics = new PIXI.Graphics();
        this.borderGraphics = new PIXI.Graphics(); // Includes grid etc, is drawn at the very back
        this.activeGraphics = new PIXI.Graphics();
        this.queueGraphics = new PIXI.Graphics();
        this.holdGraphics = new PIXI.Graphics();
        this.garbageGraphics = new PIXI.Graphics();
        this.statsText = new PIXI.Text();
    }

    moveLeft(){
        if (this.gameOver) return;

        this.state.activePiece.x--;

        if (!this.state.isValid(this.state.activePiece)){
            this.state.activePiece.x++;
        }

        this.tspinCheck.rotated = false;

        drawActive(this);
    }

    moveRight(){
        if (this.gameOver) return;

        this.state.activePiece.x++;

        if (!this.state.isValid(this.state.activePiece)){
            this.state.activePiece.x--;
        }

        this.tspinCheck.rotated = false;

        drawActive(this);
    }

    moveDown(){
        if (this.gameOver) return;

        this.state.activePiece.y--;

        if (!this.state.isValid(this.state.activePiece)){
            this.state.activePiece.y++;
            return false;
        }

        this.tspinCheck.rotated = false;

        drawActive(this);
        return true;
    }

    testRotate(kickCoords){
        let kick = 0;
        let currentPiece = this.state.activePiece

        for (let kickCoord of kickCoords){
            currentPiece.x += kickCoord.x;
            currentPiece.y += kickCoord.y;

            if (this.state.isValid(currentPiece)){
                this.tspinCheck.kickFive = kick === 4;
                this.tspinCheck.rotated = true;
                return true;
            }

            kick++;
            currentPiece.x -= kickCoord.x;
            currentPiece.y -= kickCoord.y;
        }

        return false;
    }

    rotateCW(){
        if (this.gameOver) return;

        let currentPiece = this.state.activePiece;
        if (currentPiece.type === piece_T.O) return;

        let kickCoords = CW_KICKS[+(currentPiece.type === piece_T.I)][currentPiece.rotation];
        currentPiece.rotation = (currentPiece.rotation + 1) % 4;

        if (this.testRotate(kickCoords)) {
            drawActive(this);
            return true;
        }

        currentPiece.rotation = (currentPiece.rotation + 3) % 4;
        drawActive(this);
        return false;
    }

    rotateCCW(){
        if (this.gameOver) return;

        let currentPiece = this.state.activePiece;
        if (currentPiece.type === piece_T.O) return;

        let kickCoords = CCW_KICKS[+(currentPiece.type === piece_T.I)][currentPiece.rotation];
        currentPiece.rotation = (currentPiece.rotation + 3) % 4;

        if (this.testRotate(kickCoords)) {
            drawActive(this);
            return true;
        }

        currentPiece.rotation = (currentPiece.rotation + 1) % 4;
        drawActive(this);
        return false;
    }

    hold(){
        if (!this.canHold) return;

        if (this.gameOver) return;

        this.state.hold();
        this.canHold = false;

        drawActive(this);
        drawQueue(this);
        drawHold(this);
    }

    hardDrop(){
        while(this.moveDown()){}
        this.state.placePiece(this.state.activePiece);

        if (!this.state.clearLines(this.tspinCheck)) {
            this.state.tankGarbage();
        }
        this.state.spawnPiece();

        drawGarbage(this);

        if (this.state.isValid(this.state.activePiece)) {
            this.canHold = true;
            this.pieceCount++;
            this.state.stats.pieceCount++;
            if (this.pieceCount % 7 === 0) {
                this.state.sevenBag();
            }

            drawBoard(this);
            drawQueue(this);
            drawActive(this);
            drawHold(this);
        } else {
            this.state.gameOver();
            let temp = this.state.activePiece.type
            this.state.activePiece.type = piece_T.NO_PIECE;
            drawBoard(this);
            drawActive(this);

            this.gameOver = true;

            this.state.activePiece.type = temp;
        }
    }

    garbageIn(lines){
        this.state.garbageIn(lines);

        drawGarbage(this);
    }

    // <----------- DRAWING FUNCTIONS ------------>
    init(){
        this.gameOver = false;
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
    }

    destroy(){
        this.boardGraphics.clear();
        this.borderGraphics.clear();
        this.activeGraphics.clear();
        this.queueGraphics.clear();
        this.holdGraphics.clear();
        this.garbageGraphics.clear();

        this.app.stage.removeChild(this.boardGraphics);
        this.app.stage.removeChild(this.borderGraphics);
        this.app.stage.removeChild(this.activeGraphics);
        this.app.stage.removeChild(this.queueGraphics);
        this.app.stage.removeChild(this.holdGraphics);
        this.app.stage.removeChild(this.garbageGraphics);
        this.app.stage.removeChild(this.statsText);

    }
}