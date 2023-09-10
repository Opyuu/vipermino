function shuffle(array){
    let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

class gamestate{
    board = [];
    coords = new coord(0, 0)
    piecetype;
    rotation;
    queue = [];
    piececount = 0;
    attack = 0;
    hold = 0;

    constructor(){
        
    }

    init(){
        this.queue = [1, 2, 3, 4, 5, 6, 7];
        this.queue = shuffle(this.queue);
    
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

    encodequeue(){ // Used at start of game
        let queue = 0;
        for (let i = 6; i >= 0; i--){
            queue *= 8;
            queue += this.queue[i];
        }
        return queue;
    }

    sevenbag(){ // Generate a new queue
        let bag = [1, 2, 3, 4, 5, 6, 7];
        let queue = 0;
        bag = shuffle(bag);
        for(let i = 0; i < 7; i++){
            this.queue.push(bag[i]);
        }

        for (let i = 6; i >= 0; i--){
            queue *= 8;
            queue += bag[i];
        }
        return queue;
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

    getLines(){
        let lines = [];
        for (let row = 0; row < 40; row++){
            let value = 1;
            for (let col = 0; col < 10; col++){
                value *= this.board[col][row]
            }
            
            if (value != 0){
                lines.push(row);
            }
        }
        return lines;
    }

    clearLines(){// Clears multiple lines
        for (let row = 0; row < 40; row++){
            let value = 1;
            for (let col = 0; col < 10; col++){
                value *= this.board[col][row];
            }

            if (value != 0){
                this.clearLine(row);
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

    unplace(piece, rot, x, y){
        let xpos = 0;
        let ypos = 0;
        for (let mino = 0; mino < 4; mino++){
            xpos = x + pieceTable[piece][rot][mino].x;
            ypos = y + pieceTable[piece][rot][mino].y;
            this.board[xpos][ypos] = 0;
        }
    }
}