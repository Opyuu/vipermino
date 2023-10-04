class Game{
    state;
    app;
    boardGraphics;

    constructor(app) {
        this.state = new GameState();
        this.app = app;
        this.boardGraphics = new PIXI.Graphics();
        this.borderGraphics = new PIXI.Graphics(); // Includes grid etc, is drawn at the very back
        this.activeGraphics = new PIXI.Graphics();
        this.queueGraphics = new PIXI.Graphics();
        this.holdGraphics = new PIXI.Graphics();
    }

    destroy(){
        this.boardGraphics.clear();
    }

    init(){
        this.boardGraphics.position.set(6 * BLOCK_SIZE, 0);
        this.boardGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.borderGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.activeGraphics.position.set(6 * BLOCK_SIZE, 0);
        this.activeGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.queueGraphics.position.set((6 + COLS) * BLOCK_SIZE, 4 * BLOCK_SIZE);
        this.queueGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.holdGraphics.position.set(0, 4 * BLOCK_SIZE);
        this.holdGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
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
        this.borderGraphics.moveTo(-offset + 6, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(-offset + 6, 4);
        this.borderGraphics.moveTo(-offset * 2 + 6, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(COLS + offset * 2 + 6, RENDER_ROWS + offset);
        this.borderGraphics.moveTo(COLS + offset + 6, RENDER_ROWS + offset);
        this.borderGraphics.lineTo(COLS + offset + 6, 4);
        this.borderGraphics.endFill();

        this.borderGraphics.lineStyle(GRID_SIZE/BLOCK_SIZE, GRID_COLOUR);

        // Grids
        for (let i = 1; i < COLS; i++){
            this.borderGraphics.moveTo(i + 6, 4);
            this.borderGraphics.lineTo(i + 6, RENDER_ROWS);
        }
        for (let j = RENDER_ROWS - 1; j > 3; j--){
            this.borderGraphics.moveTo(6, j);
            this.borderGraphics.lineTo(16, j);
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
        this.borderGraphics.moveTo(16, 4);
        this.borderGraphics.lineTo(22, 4);
        this.borderGraphics.moveTo(22 - offset, 4);
        this.borderGraphics.lineTo(22 - offset, 20);
        this.borderGraphics.moveTo(22, 20);
        this.borderGraphics.lineTo(16, 20);
        this.app.stage.addChild(this.borderGraphics);
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

    hold(){
        this.state.hold();
        this.drawHold();
        this.drawActive();
    }

    hardDrop(){
        this.state.hardDrop();
        this.drawBoard();
        this.drawActive();
        this.drawQueue();
        this.drawHold();
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
}

