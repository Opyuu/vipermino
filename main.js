const worker = new Worker('worker.js');

const game_canvas = document.getElementById("board");
let t1 = 0;
let t2 = 0;


function init(){
    worker.postMessage({type: 'init'});
}

function evaluate(){
    worker.postMessage({type: 'eval'});
}

function play(){
    game = new Game(game_canvas);
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
    game.parseMove(e.data.value);
    console.warn(e.data.value);
    game.state.clearLines();
    game.drawframe();

    worker.postMessage({type: 'eval'});
}