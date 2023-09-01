const worker = new Worker('worker.js');

const game_canvas = document.getElementById("board");
const queue_canvas = document.getElementById("queue");
const hold_canvas = document.getElementById("hold");
let t1 = 0;
let t2 = 0;


function init(){
    worker.postMessage({type: 'init'});
}

function evaluate(){
    worker.postMessage({type: 'eval'});
}

function play(){
    game = new Game(game_canvas, queue_canvas, hold_canvas);
    game.init();
    game.drawframe();

    init();
    evaluate();

    gameLoop();
}


function gameLoop(){
    t1 = performance.now();
    // Draw frame only when COBRA plays a move
    console.log("Game running");
    t2 = performance.now()
    setTimeout(gameLoop, FPS_DELTA - t2 + t1);
}


worker.onmessage = (e) =>{

    game.state.piececount++;
    if (game.state.piececount % 7 == 0){
        game.state.sevenbag();
    }

    game.parseMove(e.data.value); // Move received
    
    setTimeout(function (){
        // Play the move
        game.state.clearLines();
        game.drawframe();
        worker.postMessage({type: 'eval'});
    }, 500);
    
}