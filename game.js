class Game{
    constructor(canvas){
        this.game_canvas = canvas; // Canvas for rendering
        this.game_ctx = canvas.getContext("2d");
        this.state = new gamestate(); // This.board creates a board class
        // this.counterinfo for things like counters and attacks
    }

    init(){
        game.state.init();
        this.game_ctx.canvas.width = COLS * BLOCK_SIZE;
        this.game_ctx.canvas.height = RENDER_ROWS * BLOCK_SIZE;
        this.game_ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
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

        this.state.place(piece, rotation, x, y);
    }
}
