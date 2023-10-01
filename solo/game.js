class Game{

    constructor(app){
        this.state = new Gamestate();
        this.app = app;
        this.boardGraphics = new PIXI.Graphics();
        this.gridGraphics = new PIXI.Graphics();
        this.queueGraphics = new PIXI.Graphics();
        this.holdGraphics = new PIXI.Graphics();
        this.activeGraphics = new PIXI.Graphics(); // Includes active piece & piece shadow
    }

    destroy(){
        this.boardGraphics.clear();
        this.gridGraphics.clear();
        this.queueGraphics.clear();
        this.holdGraphics.clear();
        this.activeGraphics.clear();

        this.app.stage.removeChild(this.boardGraphics);
        this.app.stage.removeChild(this.gridGraphics);
        this.app.stage.removeChild(this.queueGraphics);
        this.app.stage.removeChild(this.holdGraphics);
        this.app.stage.removeChild(this.activeGraphics);

    }

    init(){
        game.state.init();
        this.boardGraphics.position.set(6 * BLOCK_SIZE, 0);
        this.boardGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.gridGraphics.position.set(6 * BLOCK_SIZE, 0);
        this.gridGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.holdGraphics.position.set(0, 4 * BLOCK_SIZE);
        this.holdGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);

        this.queueGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.queueGraphics.position.set( (6 + COLS) * BLOCK_SIZE, 4 * BLOCK_SIZE);

        this.activeGraphics.scale.set(BLOCK_SIZE, BLOCK_SIZE);
        this.activeGraphics.position.set(6 * BLOCK_SIZE, 0);

        this.state.hold = this.state.queue[0];
        this.drawGrid();
        this.drawFrame();
        this.drawHold();
        this.drawQueue();
    }

    drawGrid(){
        // Draw background?
        this.gridGraphics.lineStyle(GRID_SIZE/BLOCK_SIZE, GRID_COLOUR);

        for (let i = 1; i < COLS; i++){ // Horizontal
            this.gridGraphics.moveTo(i, 4);
            this.gridGraphics.lineTo(i, RENDER_ROWS);
        }
        for (let j = RENDER_ROWS - 1; j > 3; j--){ // Vertical
            this.gridGraphics.moveTo(0, j);
            this.gridGraphics.lineTo(10, j);
        }

        this.app.stage.addChild(this.gridGraphics);
    }

    drawBorder(){
        let offset = (BORDER_SIZE/BLOCK_SIZE) / 2; // Line starts from centre, need to offset so the drawing is correct
        this.boardGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.boardGraphics.moveTo(-offset, RENDER_ROWS + offset);
        this.boardGraphics.lineTo(-offset, 4);

        this.boardGraphics.moveTo(-offset * 2, RENDER_ROWS + offset);
        this.boardGraphics.lineTo(COLS + offset * 2, RENDER_ROWS + offset);

        this.boardGraphics.moveTo(COLS + offset, RENDER_ROWS + offset);
        this.boardGraphics.lineTo(COLS + offset, 4);
        this.boardGraphics.endFill();
    }

    drawFrame(){
        // Remove graphics from app so it acts as a buffer
        this.app.stage.removeChild(this.boardGraphics);
        this.boardGraphics.clear();
        
        // Draw board
        this.drawBoard();
        this.drawBorder();
        // this.drawBorder();
        this.drawActive();

        this.app.stage.addChild(this.boardGraphics);  
    }

    drawActive(){
        this.activeGraphics.clear();

        this.activeGraphics.beginFill(PIECE_COLOUR[this.state.queue[0]]);
        let row = 2;
        let col = 4;
        for (let mino = 0; mino < 4; mino++){
            let x = col + pieceTable[this.state.queue[0]][0][mino].x
            let y = row - pieceTable[this.state.queue[0]][0][mino].y
            this.activeGraphics.beginTextureFill({texture: PIECE_TEXTURE[this.state.queue[0]], matrix: scalingMatrix});
            this.activeGraphics.drawRect(x, y, 1, 1);
            this.activeGraphics.endFill();
        }
    }

    drawShadow(piece, rotation, x, y){
        for (let mino = 0; mino < 4; mino++){
            let xpos = x + pieceTable[piece][rotation][mino].x;
            let ypos = y + pieceTable[piece][rotation][mino].y;
            this.activeGraphics.beginFill(0x000000);
            this.activeGraphics.drawRect(xpos, RENDER_ROWS - ypos - 1, 1, 1);
            this.activeGraphics.endFill();

            this.activeGraphics.beginTextureFill({texture: SHADOW_TEXTURE[piece], matrix: scalingMatrix});
            this.activeGraphics.drawRect(xpos, RENDER_ROWS - ypos - 1, 1, 1);
            this.activeGraphics.endFill();
        }
    }

    drawBoard(){
        let clearRows = this.state.getLines();
        // If line is in clear rows, draw something fancy over it
        for (let row = 0; row < RENDER_ROWS; row++){
            for (let col = 0; col < COLS; col++){
                if (this.state.board[col][row] === 0) continue;

                let cellX = col;
                let cellY = (RENDER_ROWS - row - 1);
                
                // let cellColor = PIECE_COLOUR[this.state.board[col][row]];
                if (clearRows.includes(row)){
                    this.boardGraphics.beginFill(LINECLEAR_COLOUR);
                    this.boardGraphics.drawRect(cellX, cellY, 1, 1);
                    this.boardGraphics.endFill();
                } else{
                    this.boardGraphics.beginTextureFill({texture: PIECE_TEXTURE[this.state.board[col][row]], matrix: scalingMatrix});
                    this.boardGraphics.drawRect(cellX, cellY, 1, 1);
                    this.boardGraphics.endFill();
                }
            }
        } 
    }

    drawQueue(){
        this.app.stage.removeChild(this.queueGraphics);
        this.queueGraphics.clear();

        let offset = (BORDER_SIZE/BLOCK_SIZE) / 2;
        let minoYPos = 1;

        // Loop through every piece in queue
        for (let i = 1; i < 6; i++){
            this.queueGraphics.beginFill(PIECE_COLOUR[this.state.queue[i]]);
            let xoffset = this.state.queue[i] === 1 || this.state.queue[i] === 2 ? 2 : 2.5; // Offsets for centering individual pieces
            let yoffset = this.state.queue[i] === 1 ? 0.5 : 1;
            for (let mino = 0; mino < 4; mino++){
                let x = pieceTable[this.state.queue[i]][0][mino].x + xoffset;
                let y = minoYPos - pieceTable[this.state.queue[i]][0][mino].y + yoffset;
                let translationMatrix = new PIXI.Matrix();
                translationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);

                // this.holdGraphics.drawRect(x, y, 1, 1);
                this.queueGraphics.beginTextureFill({
                    texture: PIECE_TEXTURE[this.state.queue[i]],
                    matrix: translationMatrix.translate(xoffset - 2, yoffset)
                });
                this.queueGraphics.drawRect(x, y, 1, 1);
                this.queueGraphics.endFill();
            }
            minoYPos += 3;
        }

        // Draw borders
        this.queueGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
        this.queueGraphics.moveTo(0, 0);
        this.queueGraphics.lineTo(6, 0);
        this.queueGraphics.moveTo(6 - offset, 0);
        this.queueGraphics.lineTo(6 - offset, 16);
        this.queueGraphics.moveTo(6, 16);
        this.queueGraphics.lineTo(0, 16);

        this.app.stage.addChild(this.queueGraphics);
    }

    drawHold(){
        if (this.state.hold === 0) return;
        this.app.stage.removeChild(this.holdGraphics);
        this.holdGraphics.clear();

        this.holdGraphics.beginFill(PIECE_COLOUR[this.state.hold]);

        const xoffset = this.state.hold === 1 || this.state.hold === 2 ? 2 : 2.5;
        const yoffset = this.state.hold === 1 ? 0.5 : 1;

        for (let mino = 0; mino < 4; mino++){
            let x = pieceTable[this.state.hold][0][mino].x + xoffset; 
            let y = 1 - pieceTable[this.state.hold][0][mino].y + yoffset;

            let translationMatrix = new PIXI.Matrix();
            translationMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);

            // this.holdGraphics.drawRect(x, y, 1, 1);
            this.holdGraphics.beginTextureFill({
                texture: PIECE_TEXTURE[this.state.hold],
                matrix: translationMatrix.translate(xoffset - 2, yoffset)
            });
            this.holdGraphics.drawRect(x, y, 1, 1);
            this.holdGraphics.endFill();
        }

        // Lines
        let offset = (BORDER_SIZE/BLOCK_SIZE) / 2;

        // Draw borders
        this.holdGraphics.lineStyle(BORDER_SIZE / BLOCK_SIZE, BORDER_COLOUR);
        this.holdGraphics.moveTo(0, 0);
        this.holdGraphics.lineTo(6, 0);
        this.holdGraphics.moveTo(6, 4);
        this.holdGraphics.lineTo(0, 4);
        this.holdGraphics.moveTo(offset, 4);
        this.holdGraphics.lineTo(offset, 0);

        this.app.stage.addChild(this.holdGraphics);
    }
    

    // Functions to communicate with wasm
    parseMove(move){
        let y = move.location.y;
        let x = move.location.x;
        let rotation = move.location.rotation;
        let piece = move.location.piece;

        let attack = parseInt(move.attack);
        game.state.attack += attack;
        game.state.piececount++;

        if (piece === this.state.hold){
            this.state.hold = this.state.queue.shift(); // If the piece placed was the hold piece, swap hold with next piece
        }
        else{
           this.state.queue.shift();
        }

        this.state.place(piece, rotation, x, y);
        this.drawFrame(); // Draw line clears
        this.state.unplace(piece, rotation, x, y);

        this.app.stage.removeChild(this.activeGraphics);
        this.drawShadow(piece, rotation, x, y);
        this.app.stage.addChild(this.activeGraphics);
    
        this.drawBorder();

        this.state.place(piece, rotation, x, y);
    }

}
