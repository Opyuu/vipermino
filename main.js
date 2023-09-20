const worker = new Worker('worker.js');

const pps = document.getElementById("pps");
const PPSslider = document.getElementById("PPSSlider");
const ppsOutput = document.getElementById("PPSlimit");
const depthSlider = document.getElementById("DepthSlider");
const depthOutput = document.getElementById("Depth");

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

document.getElementById('board').appendChild(app.view);

game = new Game(app);
game.init();

var gameRunning = false;
var startTime;
var moveDelay = 1000/3;
var depth = 10;
var showSetting = false;
var fumen = "";

function init(){
    let q = game.state.encodeQueue();
    q += game.state.sevenBag();
    q += game.state.sevenBag();
    worker.postMessage({type: 'start', board: fumen, queue: q}); // Pass q1 to q3
    startTime = performance.now();
    sliderTime = performance.now();
    game.state.hold = game.state.queue.shift(); // Move first piece to hold
}

function play(){
    if (gameRunning) return;
    gameRunning = true;
    init();

    game.drawFrame();
    game.drawQueue();
    game.drawHold();

    worker.postMessage({type: 'suggest', depth: depth});
    gameLoop();
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
        // parseFumen();
    }
}

function parse_fumen(fumen){
    let minoCounter = 0;

    let splitFumen = fumen.split("@")[1]; // Remove version header
    splitFumen = splitFumen.substring(0, splitFumen.length - 3); // Remove piece appended at end
    splitFumen = splitFumen.replace(/[?]/g, ''); // Remove ? separators
    pairs = splitFumen.match(/.{2}/g); // Split fumen into pairs
    for (let i = 0; i < pairs.length; i++){ // Loop through pairs
        value1 = ENCODE_TABLE.indexOf(pairs[i][0]);
        value2 = ENCODE_TABLE.indexOf(pairs[i][1]);

        // Calculate num & the corresponding piece values
        let num = value1 + value2 * 64;

        pieceType = Math.abs(Math.floor(num / 240 - 8));
        pieceCount = num % 240 + 1;
        
        // Place piece onto board
        for (let j = 0; j < pieceCount; j++){
            let newPos = j + minoCounter;
            let x = newPos % 10;
            let y = 22 - Math.floor(newPos / 10);
            if(y < 0) return; // Last piece
            game.state.board[x][y] = pieceType;
        }
        minoCounter = minoCounter + pieceCount;
    }
}
// Update the current slider value (each time you drag the slider handle)
PPSslider.oninput = function() {
    if (this.value == 15){
        ppsOutput.innerHTML = "PPS limit: Uncapped";
        moveDelay = 0;
    } 
    else{
        ppsOutput.innerHTML = "PPS limit: " + this.value;
        moveDelay = 1000 / this.value;
    }
}

depthSlider.oninput = function() {
    depthOutput.innerHTML = "Depth: " + this.value;
    depth = parseInt(this.value);
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
    worker.postMessage({type: 'quit'});
    game.destroy();
    delete game;
    game = new Game(app);
    game.init();
}

worker.onmessage = (e) =>{
    if (gameRunning == false) return; // Avoids uncaught errors.
    if (e.data.value == 0) return; // When game is over, don't play more moves
    if (e.data.type != 'suggestion') return; // Ignore other messages that aren't suggestions

    game.parseMove(e.data.move); // Move received & played. Draws shadow piece
    game.drawHold(); // Update hold 
    game.drawQueue(); // Update queue - piece used

    let delay = Math.max(0, moveDelay /*- e.data.time*/);
    setTimeout(() => {
        if (gameRunning == false) return // Is game still running after the timeout?
        // Actually play the move
        game.state.clearLines();

        // Update board & queue
        game.drawFrame();
        game.drawQueue();

        let queue = 0
        if (game.state.piececount % 7 == 0) {
            queue = game.state.sevenBag();
            worker.postMessage({type: 'newpiece', piece: queue});
        }

        worker.postMessage({type: 'suggest', depth: depth}); // Continue evaluating if game hasn't been stopped
    }, delay);
}