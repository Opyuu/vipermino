class gamestate{
    board = [];
    coords = new coord(0, 0)
    piecetype;
    rotation;

    constructor(){
        
    }

    init(){
        // Initialise board to all 0s
        for(let col = 0; col < 10; col++){
            this.board[col] = [];
        }
        for(let col = 0; col < 10; col++){
            for (let row = 0; row < 40; row++){
                this.board[col][row] = 0;
            }
        }
    }

    clearLine(line){ // Clears a singular line
        for (let col = 0; col < 10; col++){
            this.board[col][line] = 0;
        }
        // Move all rows from above down
        for (let row = line + 1; row < 40; row++){
            for (let col = 0; col < 10; col++){
                this.board[col][row - 1] = this.board[col][row];
            }
        }
    }

    clearLines(){// Clears multiple lines
        for (let row = 0; row < 40; row++){
            let value = 1;
            for (let col = 0; col < 10; col++){
                value *= this.board[col][row];
            }

            if (value != 0){
                this.clearLine(row);
                console.log(row, "needs clearing");
                row--;
            }
        }
    } 

    place(piece, rot, x, y){
        let xpos = 0;
        let ypos = 0;
        for (let mino = 0; mino < 4; mino++){
            xpos = x + pieceTable[piece][rot][mino].x;
            ypos = y + pieceTable[piece][rot][mino].y;
            this.board[xpos][ypos] = piece;
        }
    }
}