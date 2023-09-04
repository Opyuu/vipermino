const worker = new Worker('worker.js');

const game_canvas = document.getElementById("board");
const queue_canvas = document.getElementById("queue");
const hold_canvas = document.getElementById("hold");

let t1 = 0;
let t2 = 0;


function init(){
    let q1 = game.state.encodequeue();
    let q2 = game.state.sevenbag();
    let q3 = game.state.sevenbag();
    // Pass queue into wasm
    // Call seven bag 2 more times and pass those to wasm
    // Pass q1 q2 q3
    worker.postMessage({type: 'init', v1: q1, v2: q2, v3: q3});
    game.state.hold = game.state.queue.shift(); // Move first piece to hold
}

function evaluate(){
    worker.postMessage({type: 'eval', q: 0});
}

function play(){
    game = new Game(game_canvas, queue_canvas, hold_canvas);
    game.init();
    init();

    game.drawframe();
    game.drawQueue();
    game.drawHold();

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

    game.parseMove(e.data.value); // Move received
    game.drawHold(); // Update hold 
    game.drawQueue();
    

    // Shadow piece can be held piece so that'll be rendered. Queue will also change. 
    
    setTimeout(function (){
        // Play the move
        game.state.clearLines();
        // Update board & queue
        game.drawframe();
        game.drawQueue();
        let queue = 0
        if (game.state.piececount % 7 == 0){
            queue = game.state.sevenbag();
        }
        else{
            queue = 0;
        } // Pass queue into wasm
        worker.postMessage({type: 'eval', q: queue});
    }, 500);
    
}