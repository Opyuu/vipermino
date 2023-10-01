const worker = new Worker('worker.js');

const menu = document.getElementById("settings");
const pps = document.getElementById("pps");
const PPSslider = document.getElementById("PPSSlider");
const ppsOutput = document.getElementById("PPSlimit");
const depthSlider = document.getElementById("DepthSlider");
const depthOutput = document.getElementById("Depth");
const fumenInput = document.getElementById("Fumen");
const queueInput = document.getElementById("Queue");

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

// Move these to game class? globals are kind of yuck
let gameRunning = false;
let startTime;
let moveDelay = 1000/3;
let depth = 10;
let showSetting = false;
let fumen = "";

function init(){
    let q = game.state.encodeQueue();
    q += game.state.sevenBag();
    q += game.state.sevenBag();
    worker.postMessage({type: 'start', board: fumen, queue: q}); // Pass q1 to q3
    game.state.hold = game.state.queue.shift(); // Move first piece to hold
}


function play(){
    if (gameRunning) return;
    gameRunning = true;
    init();

    game.drawQueue();
    game.drawHold();
    game.drawFrame();

    startTime = performance.now();
    worker.postMessage({type: 'suggest', depth: depth});
    gameLoop();
}


function toggleSetting(){
    if (!showSetting){
        showSetting = true;
        menu.style.display = "block";
    }
    else{
        showSetting = false;
        menu.style.display = "none";
        fumenToBoard();
        queueToBoard();
    }
}

queueInput.oninput = function(){
    this.value = this.value.toUpperCase(); // Force upper case for input of queue
}

function queueToBoard(){
    let queue = queueInput.value;
    if (queue === "") return;
    for (let char of queue){
        if (!PIECES.includes(char)) {
            alert("Invalid queue");
            showSetting = true;
            menu.style.display = "block";
            return;
        }
    }

    if (gameRunning) return;
    game.state.clearQueue();
    for (let char of queue){
        game.state.queue.push(PIECE_CHAR.indexOf(char));
    }
    game.drawQueue();
    game.state.hold = game.state.queue[0];
    game.drawHold();
}

function fumenToBoard(){
    if (gameRunning) return;

    fumen = fumenInput.value;
    try{
        parseFumen(fumen);
    } catch(err){ 
        game.state.clearBoard();
        fumen = "";
        alert("Invalid fumen");
        showSetting = true;
        menu.style.display = "block";
    }  
    game.drawFrame();
    game.drawQueue();
    game.drawHold();
}


function parseFumen(fumen){
    if (fumen === "") return;
    let minoCounter = 0;

    let splitFumen = fumen.split("@")[1]; // Remove version header
    splitFumen = splitFumen.substring(0, splitFumen.length - 3); // Remove piece appended at end
    splitFumen = splitFumen.replace(/[?]/g, ''); // Remove ? separators
    let pairs = splitFumen.match(/.{2}/g); // Split fumen into pairs
    for (let i = 0; i < pairs.length; i++){ // Loop through pairs
        let value1 = ENCODE_TABLE.indexOf(pairs[i][0]);
        let value2 = ENCODE_TABLE.indexOf(pairs[i][1]);

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
            game.state.board[x][y] = FUMEN_PIECE[pieceType];
        }
        minoCounter = minoCounter + pieceCount;
    }
}

// Update the current slider value (each time you drag the slider handle)
PPSslider.oninput = function() {
    if (this.value === 15){
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
    fumenToBoard();
    queueToBoard();
}

worker.onmessage = (e) =>{
    if (gameRunning === false) return; // Avoids uncaught errors.
    if (e.data.value === 0) return; // When game is over, don't play more moves
    if (e.data.type !== 'suggestion') return; // Ignore other messages that aren't suggestions

    game.parseMove(e.data.move); // Move received & played. Draws shadow piece
    game.drawHold(); // Update hold 
    game.drawQueue(); // Update queue - piece used

    let delay = Math.max(0, moveDelay /*- e.data.time*/);
    setTimeout(() => {
        if (gameRunning === false) return // Is game still running after the timeout?
        // Actually play the move
        game.state.clearLines();

        // Update board & queue
        game.drawFrame();
        game.drawQueue();

        let queue = 0
        if (game.state.piececount % 7 === 0) {
            queue = game.state.sevenBag();
            worker.postMessage({type: 'newpiece', piece: queue});
        }

        worker.postMessage({type: 'suggest', depth: depth}); // Continue evaluating if game hasn't been stopped
    }, delay);
}