class Game{
    constructor(game_canvas, queue_canvas, hold_canvas){
        this.state = new gamestate();

        this.game_canvas = game_canvas; // Canvas for rendering
        this.game_ctx = game_canvas.getContext("2d");
        

        this.queue_canvas = queue_canvas;
        this.queue_ctx = queue_canvas.getContext("2d");

        this.hold_canvas = hold_canvas;
        this.hold_ctx = hold_canvas.getContext("2d");
        // this.counterinfo for things like counters and attacks
    }

    init(){
        game.state.init();
        this.game_ctx.canvas.width = COLS * BLOCK_SIZE;
        this.game_ctx.canvas.height = RENDER_ROWS * BLOCK_SIZE;
        this.game_ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.queue_ctx.canvas.width = 6 * BLOCK_SIZE;
        this.queue_ctx.canvas.height = 16 * BLOCK_SIZE;
        this.queue_ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.hold_ctx.canvas.width = 6 * BLOCK_SIZE;
        this.hold_ctx.canvas.height = 6 * BLOCK_SIZE;
        this.hold_ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    drawframe(){
        this.game_ctx.clearRect(0, 0, 10, 24);

        console.log("drawing frame");
        // Draw background
        this.game_ctx.fillStyle = BACKGROUND_COLOUR;
        this.game_ctx.fillRect(0, 4, 10, 20);

        // Draw board
        for (let col = 0; col < COLS; col++){
            for (let row = 0; row < RENDER_ROWS; row++){
                if (this.state.board[col][row] == 0) continue;
                this.game_ctx.fillStyle = PIECE_COLOUR[this.state.board[col][row]];
                this.game_ctx.fillRect(col, RENDER_ROWS - row - 1, 1, 1);
            }
        }

        // // Draw active piece
        this.game_ctx.fillStyle = PIECE_COLOUR[this.state.queue[0]];
        let row = 3;
        let col = 5;
        for (let mino = 0; mino < 4; mino++){
            this.game_ctx.fillRect(col + pieceTable[this.state.queue[0]][0][mino].x, row - pieceTable[this.state.queue[0]][0][mino].y, 1, 1)
        }
    }

    drawQueue(){
        this.queue_ctx.clearRect(0, 0, 6, 16);
        let y_offset = 1;
        // Pieces 1, 2, 3, 4, 5. Piece 0 will be active.
        for (let i = 1; i < 6; i++){
            this.queue_ctx.fillStyle = PIECE_COLOUR[this.state.queue[i]];
            for (let mino = 0; mino < 4; mino++){
                let x = pieceTable[this.state.queue[i]][0][mino].x;
                let y = y_offset - pieceTable[this.state.queue[i]][0][mino].y;
                this.queue_ctx.fillRect(1 + x, y, 1, 1);
            }
            y_offset += 3;
        }
    }

    drawHold(){
        this.hold_ctx.clearRect(0, 0, 4, 4);

        this.hold_ctx.fillStyle = PIECE_COLOUR[this.state.hold];
        for (let mino = 0; mino < 4; mino ++){
            let x = 1 + pieceTable[this.state.hold][0][mino].x;
            let y = 1 - pieceTable[this.state.hold][0][mino].y;
            this.hold_ctx.fillRect(x, y, 1, 1);
        }
    }
 

    // Functions to communicate with wasm
    parseMove(move){
        let y = move % 100;
        move = Math.floor(move / 100);
        let x = move % 10;
        move = Math.floor(move / 10);
        let rotation = move % 10;
        move = Math.floor(move / 10);
        let piece = move % 10;

        if (piece == this.state.hold){
            this.state.hold = this.state.queue.shift(); // If the piece placed was the hold piece, swap hold with next piece
        }
        else{
           this.state.queue.shift();
        }

        this.drawframe(); // Need to draw new current piece when placed
        // console.warn(piece);
        this.game_ctx.fillStyle = SHADOW_COLOUR[piece];
        for (let mino = 0; mino < 4; mino++){
            let xpos = x + pieceTable[piece][rotation][mino].x;
            let ypos = y + pieceTable[piece][rotation][mino].y;

            this.game_ctx.fillRect(xpos, RENDER_ROWS - ypos - 1, 1, 1);
        }
        this.state.place(piece, rotation, x, y);
    }

}
