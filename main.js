const worker = new Worker('worker.js');

const pps = document.getElementById("pps");
const slider = document.getElementById("PPSSlider");
const output = document.getElementById("PPSlimit");

/* Plans:
    make sure to only update the right parts of the canvas that requires updating
    Change simple minos to sprites
    Particles?
*/

const app = new PIXI.Application({
    width: (COLS + 12) * BLOCK_SIZE, // 6 for hold and 6 for queue
    height: (RENDER_ROWS+1) * BLOCK_SIZE,
    antialias: true,
    resolution: 1,
});

document.getElementById('boardnew').appendChild(app.view);

game = new Game(app);
game.init();

var gameRunning = false;
var startTime;
var moveDelay = 0;
var showSetting = false;

function init(){
    let q1 = game.state.encodequeue();
    let q2 = game.state.sevenbag();
    let q3 = game.state.sevenbag();
    worker.postMessage({type: 'init', v1: q1, v2: q2, v3: q3}); // Pass q1 to q3
    startTime = performance.now();
    sliderTime = performance.now();
    game.state.hold = game.state.queue.shift(); // Move first piece to hold
}

function play(){
    if (gameRunning) return;
    gameRunning = true;
    init();

    game.drawframe();
    game.drawQueue();
    game.drawHold();

    worker.postMessage({type: 'eval', q: 0});
    gameLoop();
}

function renderGameBoard(){
    boardGraphics.clear();

    for (let row = 0; row < RENDER_ROWS; row++){
        for (let col = 0; col < COLS; col++){
            let cellX = (col ) * BLOCK_SIZE;
            let cellY = (RENDER_ROWS - row) * BLOCK_SIZE;
            console.log(cellX, cellY);

            const cellColor = PIXI.utils.string2hex(PIECE_COLOUR[game.state.board[col][row]]);

            boardGraphics.beginFill(cellColor);
            boardGraphics.drawRect(cellX, cellY, BLOCK_SIZE, BLOCK_SIZE);
            boardGraphics.endFill();
        }
    }
}

function toggleSetting(){
    let menu = document.getElementById("settings");
    if (!showSetting){
        showSetting = true;
        menu.style.display = "block";
    }
    else{
        showSetting = false;
        menu.style.display = "none";
    }
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    if (this.value == 15){
        output.innerHTML = "PPS limit: Uncapped";
        moveDelay = 0;
    } 
    else{
        output.innerHTML = "PPS limit: " + this.value;
        moveDelay = 1000 / this.value;
    }
}

function an(){
    document.body.style.backgroundColor = '#00bbdc';
}

function gameLoop(){
    t1 = performance.now();
    let time = (t1 - startTime) / 1000;
    // Draw frame only when COBRA plays a move

    // Update counters
    document.getElementById("Timer").innerHTML = "Time: " + time.toFixed(3);
    document.getElementById("PPS").innerHTML = game.state.piececount + " | " + (game.state.piececount / time).toFixed(2) + " PPS";
    document.getElementById("APM").innerHTML = game.state.attack + " | " + (game.state.attack * 60 / time).toFixed(2) + " APM";
    document.getElementById("APP").innerHTML =(game.state.attack / game.state.piececount).toFixed(3) + " APP";

    t2 = performance.now()
    if(gameRunning) setTimeout(gameLoop, FPS_DELTA - t2 + t1);
}

function stopGame(){
    gameRunning = false;
    worker.postMessage({type: 'kill'});
    game.destroy();
    delete game;
    game = new Game(app);
    game.init();
}

worker.onmessage = (e) =>{
    if (gameRunning == false) return; // Avoids uncaught errors.
    game.state.piececount++;

    game.parseMove(e.data.value); // Move received & played. Draws shadow piece
    game.drawHold(); // Update hold 
    game.drawQueue(); // Update queue - piece used

    let delay = Math.max(0, moveDelay - e.data.time);
    setTimeout(() => {
        if (gameRunning == false) return // Is game still running after the timeout?
        // Actually play the move
        game.state.clearLines();

        // Update board & queue
        game.drawframe();
        game.drawQueue();

        let queue = 0
        if (game.state.piececount % 7 == 0) queue = game.state.sevenbag();

        worker.postMessage({type: 'eval', q: queue}); // Continue evaluating if game hasn't been stopped
    }, delay);
}