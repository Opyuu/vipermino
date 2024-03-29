let worker = new Worker('../assets/js/worker.js');
let showSetting = false;

let targetPPS = 1;
let playingDepth = 5;
let depth = 5;
let ppsLimit = 1;
let startTime = 0;

let leftDown = false;
let rightDown = false;
let dasID = 0;
let sdID = 0;
let keys = [];
let gameRunning = false;
let gameOver = false;
let kill = false;
let startAgain = false;
let waiting = false;

const PPSslider = document.getElementById("PPSSlider");
const ppsOutput = document.getElementById("PPSlimit");
const depthSlider = document.getElementById("DepthSlider");
const depthOutput = document.getElementById("Depth");

Howler.volume(0.2);


let controls = {
    "DAS": "100",
    "ARR": "20",
    "SDARR": "0",
    "Move_Down": 'ArrowDown',
    "Move_Left": 'ArrowLeft',
    "Move_Right": 'ArrowRight',
    "Rotate_CW": 'ArrowUp',
    "Rotate_CW_Secondary": 'None',
    "Rotate_CCW": 'KeyZ',
    "Rotate_CCW_Secondary": 'None',
    "Rotate_180": 'KeyA',
    "Hold": 'ShiftLeft',
    "Hard_Drop": 'Space',
    "Reset": 'KeyR'
};

const app = new PIXI.Application({
    width: (10 + 13) * 32,
    height: 25 * 32,
    antialias: true,
    resolution: 1
});

const app2 = new PIXI.Application({
    width: (10 + 13) * 32,
    height: 25 * 32,
    antialias: true,
    resolution: 1
})

document.getElementById('board').appendChild(app.view);
document.getElementById('cobraBoard').appendChild(app2.view);

const seed = Date.now();

let game = new Player(app, seed, seed);
let cobra = new Bot(app2, seed, seed, worker);


function reset(){
    if (gameRunning || !gameOver) return;

    document.removeEventListener('keydown', restart);

    game.destroy();
    cobra.destroy();

    const seed = Date.now();
    game = new Player(app, seed, seed);
    cobra = new Bot(app2, seed, seed, worker);

    gameRunning = false;
    gameOver = false;
    kill = true;
}

function handleKeyUp(event){
    event.preventDefault();
    keys[event.code] = false;
    switch (event.code){
        case controls["Move_Left"]:
            if (!keys[controls["Move_Right"]]) dasID++;
            break;

        case controls["Move_Right"]:
            if (!keys[controls["Move_Left"]]) dasID++;
            break;

        case controls["Move_Down"]:
            sdID++;
            break;
    }
}

function handleKeyDown(event){
    if (event.repeat) return;
    event.preventDefault();


    keys[event.code] = true;

    switch (event.code){
        case controls["Move_Left"]:
            leftDown = true;
            dasID++;
            das("L", dasID);
            break;

        case controls["Move_Right"]:
            rightDown = true;
            dasID++;
            das("R", dasID);
            break;

        case controls["Hard_Drop"]:
            game.hardDrop();
            break;

        case controls["Rotate_CW"]:
            game.rotateCW();
            break;

        case controls["Rotate_CW_Secondary"]:
            game.rotateCW();
            break;

        case controls["Rotate_CCW"]:
            game.rotateCCW();
            break;

        case controls["Rotate_CCW_Secondary"]:
            game.rotateCCW();
            break;

        case controls["Rotate_180"]:
            game.rotate180();
            break;

        case controls["Hold"]:
            game.hold();
            break;

        case controls["Move_Down"]:
            sdID++;
            sd(sdID);
            break;

        case controls["Reset"]:
            reset();
            start();
            break;
    }
}

function restart(event){
    if (event.repeat) return;
    if (event.code === controls["Reset"]) {

        if (gameOver) {
            start();
        } else{
            console.warn("resetting");

            reset();

            startAgain = true;
        }
    }
}

function initPlayer(){
    game.init();
    drawBorder(game);
    game.state.sevenBag();
    game.state.sevenBag();
    game.state.sevenBag();

    game.state.clearBoard();
    game.state.spawnPiece();
    drawActive(game);
    drawQueue(game);
}

function initBot(){
    cobra.init();
    drawBorder(cobra);
    cobra.state.sevenBag();
    cobra.state.sevenBag();
    cobra.state.sevenBag();

    const queue = cobra.encodeQueue();

    cobra.state.clearBoard();
    cobra.state.spawnPiece();
    cobra.hold();
    drawActive(cobra);
    drawQueue(cobra);


    worker.postMessage({type: 'start', board: "", queue: queue});


}

function start(){
    if (kill && waiting) {
        startAgain = true;
        return;
    }

    if (gameRunning || showSetting) return;

    if (!waiting){
        worker.postMessage({type: 'quit'});
    }

    dasID++;

    if (gameOver) reset();

    gameRunning = true;

    initPlayer();
    initBot();

    load_settings();

    targetPPS = ppsLimit;
    playingDepth = depth;

    worker.postMessage({type: 'suggest', depth: playingDepth});
    startTime = performance.now();

    document.addEventListener('keyup', handleKeyUp);

    document.addEventListener('keydown', handleKeyDown);

    kill = false;

    gameLoop();
}

function gameLoop(){
    const t1 = performance.now();

    if (!gameRunning) {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', restart);
        return;
    }

    drawStats(game, t1 - startTime);
    drawStats(cobra, t1 - startTime);

    let totalOut = 0;
    let totalIn = 0;

    while(game.state.outgoingGarbage.length > 0){
        let g = game.state.outgoingGarbage.shift();
        cobra.garbageIn(g);

        totalOut += g;
    }

    while (cobra.state.outgoingGarbage.length > 0){
        let g = cobra.state.outgoingGarbage.shift();
        game.garbageIn(g);

        totalIn += g;
    }

    if (!game.state.isValid(game.state.activePiece)) {
        console.warn("Game over");
        gameRunning = false;
        gameOver = true;
        totalIn = totalOut = 0;
    }

    // Sound logic

    if (totalOut > 6){
        playerSounds["garbage_out_large"].play();
    } else if (totalOut > 3){
        playerSounds["garbage_out_medium"].play();
    } else if (totalOut > 0){
        playerSounds["garbage_out_small"].play();
    }


    if (totalIn > 6){
        playerSounds["garbage_in_large"].play();
    } else if (totalIn > 3){
        playerSounds["garbage_in_medium"].play();
    } else if (totalIn > 0){
        playerSounds["garbage_in_small"].play();
    }

    const t2 = performance.now();
    // Every frame, take care of garbage sending, and that's about it i think

    setTimeout(gameLoop, 1000/20 - t2 + t1); // Garbage only sends at 20fps
}


// Movement functions
function das(dir, id){
    move(dir);
    setTimeout(() => {
        if (dasID === id){
            arr(dir, id);
        }
    }, controls["DAS"]);
}


function arr(dir, id){
    if (controls["ARR"] === "0"){
        let loop = setInterval(() => {
            if (dasID === id) move0arr(dir);
            else clearInterval(loop);
        }, 1000/60);

    } else {
        let loop = setInterval(() => {
            if (dasID === id) move(dir);
            else clearInterval(loop);
        }, controls["ARR"]);
    }

}

function move(dir){
    if (dir === "L") game.moveLeft();
    else if (dir === "R") game.moveRight();
}

function move0arr(dir){
    if (dir === "L") game.wooshLeft();
    else if (dir === "R") game.wooshRight();
}

function sd(id){
    if (controls["SDARR"] === "0"){
        let loop = setInterval(() => {
            if (sdID === id) game.wooshDown();
            else clearInterval(loop);
        }, 1000/60);

    } else {
        let loop = setInterval(() => {
            if (sdID === id) game.moveDown();
            else clearInterval(loop);
        }, controls["SDARR"]);
    }
}


function tempInit(){
    game.init();
    game.state.clearBoard();
    game.state.sevenBag();
    game.state.sevenBag();
    game.state.sevenBag();

    game.state.spawnPiece();
    drawActive(game);
    drawBoard(game);
    drawBorder(game);
    drawQueue(game);

    document.addEventListener('keyup', handleKeyUp);

    document.addEventListener('keydown', handleKeyDown);
}

worker.onmessage = (e) => {
    waiting = false;

    if (kill && gameRunning === false){
        worker.postMessage({type: 'quit'});
        kill = false;

        if (startAgain) {
            start();
            startAgain = false;
        }

        return;
    }

    if (gameOver || gameRunning === false) return;
    if (e.data.type === "gameover") {
        cobra.state.activePiece.type = piece_T.NO_PIECE;
    }
    if (e.data.type !== 'suggestion') return;

    const move = e.data.move.location;
    const spin = e.data.move.spin;

    cobra.drawPV(e.data.pv);

    let t = performance.now() - startTime;
    let duration = ((cobra.pieceCount + 1) / targetPPS * 1000) - t;

    setTimeout(() => {
        if (!gameRunning) return;

        if (move.piece === cobra.state.heldPiece) cobra.hold();
        cobra.movePiece(move, spin);
        cobra.place();
        cobra.clearLines();
        if (!cobra.state.isValid(cobra.state.activePiece)){
            console.warn("Illegal move");
            cobra.state.gameOver();
            drawBoard(cobra);
            gameRunning = false;
            gameOver = true;
            playerSounds["topout"].play();
        }
        cobra.drawPV(e.data.pv.slice(1));

        worker.postMessage({type: 'suggest', depth: playingDepth, garbage: cobra.state.garbageQueue});
        waiting = true;
    }, duration)
}