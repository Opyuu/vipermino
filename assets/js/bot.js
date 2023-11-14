class Bot{
    pieceCount = 0;

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
    }

    garbageIn(lines){
        this.state.garbageIn(lines);
        drawGarbage(this);
    }

    hold(){
        this.state.hold();
        drawHold(this);
        drawQueue(this);
    }

    movePiece(move){
        this.state.activePiece.x = move.x;
        this.state.activePiece.y = move.y;
        this.state.activePiece.rotation = move.rotation;


        drawActive(this);
    }

    place(){
        this.pieceCount++;
        this.state.placePiece(this.state.activePiece);

        if (this.pieceCount % 7 === 0){
            let q = this.state.sevenBag();

            this.worker.postMessage({type: 'newpiece', piece: q});
        }

        drawBoard(this);
        drawActive(this);
    }

    clearLines(spin){
        const info = new TspinInfo();

        info.rotated = spin === 1;

        if (!this.state.clearLines(info)){
            this.state.tankGarbage(true);
            drawGarbage(this);
        }

        this.state.spawnPiece(); // Spawn always happens after clear

        if (!this.state.isValid(this.state.activePiece)){
            let temp = this.state.activePiece.type;
            this.state.activePiece.type = piece_T.NO_PIECE;
            drawActive(this);
            drawGarbage(this);

            this.state.gameOver();
            drawBoard(this);
            this.state.activePiece.type = temp;
        } else {
            drawBoard(this);
            drawQueue(this);
            drawActive(this);
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
    }
}