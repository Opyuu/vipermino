class Game{
    state;
    app;
    boardGraphics;

    constructor(app, shuffler, garbShuffler) {
        this.state = new GameState();
        this.app = app;
        this.boardGraphics = new PIXI.Graphics();
        this.borderGraphics = new PIXI.Graphics(); // Includes grid etc, is drawn at the very back
        this.activeGraphics = new PIXI.Graphics();
        this.queueGraphics = new PIXI.Graphics();
        this.holdGraphics = new PIXI.Graphics();
        this.garbageGraphics = new PIXI.Graphics();

        this.state.shuffler = shuffler;
        this.state.garbShuffler = garbShuffler;
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

    drawBoard(){
        this.app.stage.removeChild(this.boardGraphics);
        this.boardGraphics.clear();
        this.state.drawBoard(this.boardGraphics);
        this.app.stage.addChild(this.boardGraphics);
    }

    drawBorder(){
        this.app.stage.removeChild(this.borderGraphics);

        // Board border
        let offset = (BORDER_SIZE/BLOCK_SIZE) / 2;
        this.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.borderGraphics.moveTo(-offset + 7, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(-offset + 7, 4);
        this.borderGraphics.moveTo(-offset * 2 + 7, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(COLS + offset * 2 + 7, RENDER_ROWS + offset);
        this.borderGraphics.moveTo(COLS + offset + 7, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(COLS + offset + 7, 4);
        this.borderGraphics.endFill();

        this.borderGraphics.lineStyle(GRID_SIZE/BLOCK_SIZE, GRID_COLOUR);

        // Grids
        for (let i = 1; i < COLS; i++){
            this.borderGraphics.moveTo(i + 7, 4);
            this.borderGraphics.lineTo(i + 7, RENDER_ROWS);
        }
        for (let j = RENDER_ROWS - 1; j > 3; j--){
            this.borderGraphics.moveTo(7, j);
            this.borderGraphics.lineTo(17, j);
        }
        this.borderGraphics.endFill();

        // Hold border
        this.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.borderGraphics.moveTo(0, 4);
        this.borderGraphics.lineTo(6, 4);
        this.borderGraphics.moveTo(6, 8);
        this.borderGraphics.lineTo(0, 8);
        this.borderGraphics.moveTo(offset, 8);
        this.borderGraphics.lineTo(offset, 4);
        this.borderGraphics.endFill();

        // Queue border
        this.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.borderGraphics.moveTo(17, 4);
        this.borderGraphics.lineTo(23, 4);
        this.borderGraphics.moveTo(23 - offset, 4);
        this.borderGraphics.lineTo(23 - offset, 20);
        this.borderGraphics.moveTo(23, 20);
        this.borderGraphics.lineTo(17, 20);
        this.app.stage.addChild(this.borderGraphics);

        // Garbage border
        this.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.borderGraphics.moveTo(6, 4 - offset);
        this.borderGraphics.lineTo(6, 24 + offset);
        this.borderGraphics.moveTo(6 - offset, 24 + offset);
        this.borderGraphics.lineTo(7, 24 + offset);
        this.borderGraphics.moveTo(7 - offset, 4 - offset);
        this.borderGraphics.lineTo(7 - offset, 5);


    }

    drawActive(){
        this.app.stage.removeChild(this.activeGraphics);
        this.activeGraphics.clear();
        this.state.drawShadow(this.activeGraphics);
        this.state.drawActive(this.activeGraphics);
        this.app.stage.addChild(this.activeGraphics);
    }

    drawQueue(){
        this.app.stage.removeChild(this.queueGraphics);
        this.queueGraphics.clear();
        this.state.drawQueue(this.queueGraphics);
        this.app.stage.addChild(this.queueGraphics);
    }

    drawHold(){
        this.app.stage.removeChild(this.holdGraphics);
        this.holdGraphics.clear();
        this.state.drawHold(this.holdGraphics);
        this.app.stage.addChild(this.holdGraphics);
    }

    drawGarbage(){
        this.app.stage.removeChild(this.garbageGraphics);
        this.garbageGraphics.clear();
        this.state.drawGarbage(this.garbageGraphics);
        this.app.stage.addChild(this.garbageGraphics);
    }

    hold(){
        this.state.hold();
        this.drawHold();
        this.drawActive();
        this.drawQueue();
    }

    hardDrop(){
        let queue = this.state.hardDrop();
        this.drawBoard();

        if (this.state.isValid(this.state.activePiece)) {
            this.drawActive();
            this.drawQueue();
            this.drawHold();
            this.drawGarbage();
        } else{
            this.state.activePiece.type = piece_T.NO_PIECE;
            this.drawActive();
            this.drawGarbage();
        }

        return queue;
    }

    moveLeft(){
        this.state.moveLeft();
        this.drawActive();
    }

    moveRight(){
        this.state.moveRight();
        this.drawActive();
    }

    moveDown(){
        let status = this.state.moveDown();
        this.drawActive();
        return status;
    }

    rotateCW(){
        this.state.rotateCW();
        this.drawActive();
    }

    rotateCCW(){
        this.state.rotateCCW();
        this.drawActive();
    }

    rotate180(){
        this.state.rotate180();
        this.drawActive();
    }

    spawnGarbage(count){
        this.state.spawnGarbage(count);

        this.drawBoard();
        this.drawActive();
        // Control number of garbage spawned and columns where they spawn
    }

    garbageIn(lines){
        this.state.garbageIn(lines);


        this.drawGarbage();
        // Update garbage queue render
    }
}

