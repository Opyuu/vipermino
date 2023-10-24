const worker = new Worker('worker.js');
let showSetting = false;

let targetPPS = 1;
let playingDepth = 10;
let depth = 10;
let ppsLimit = 1;
let startTime = 0;

let leftDown = false;
let rightDown = false;
let dasID = 0;
let sdID = 0;
let keys = [];
let gameRunning = false;

const PPSslider = document.getElementById("PPSSlider");
const ppsOutput = document.getElementById("PPSlimit");
const depthSlider = document.getElementById("DepthSlider");
const depthOutput = document.getElementById("Depth");


let controls = {
    "DAS": 100,
    "ARR": 20,
    "SDARR": 0,
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
let queueP1 = new PRNG(seed); // Separate seeds for garb and q
let queueP2 = new PRNG(seed);
let garbP1 = new PRNG(seed);
let garbP2 = new PRNG(seed);
let game = new Game(app, queueP1, garbP1);
let cobra = new Game(app2, queueP2, garbP2);

function load_settings(){
    controls = localStorage.getItem("controls");
    if (controls !== null){
        controls = JSON.parse(controls);
    }
    else{ // If no controls are stored, use default
        console.log("Default controls used");
        controls = {
            "DAS": 100,
            "ARR": 30,
            "SDARR": 0,
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
    }

    let botSettings = localStorage.getItem("botSettings");
    if (botSettings !== null){
        botSettings = JSON.parse(botSettings);
        ppsLimit = botSettings["PPS"];
        depth = botSettings["Depth"];
    } else{
        ppsLimit = 1;
        depth = 10;
    }
}

function save_settings(){
    localStorage.setItem('controls', JSON.stringify(controls)); // This is it??
    const botSettings = {
        "PPS": ppsLimit,
        "Depth": depth
    }
    localStorage.setItem('botSettings', JSON.stringify(botSettings));
}

function toggleSetting(){
    const menu = document.getElementById('settings');
    if (!showSetting){
        load_settings();
        showSetting = true;
        menu.style.display = "block";

        document.removeEventListener('keyup', handleKeyUp);

        document.removeEventListener('keydown', handleKeyDown);

        document.getElementById("DAS").value = controls["DAS"];
        document.getElementById("ARR").value = controls["ARR"];
        document.getElementById("SDARR").value = controls["SDARR"];

        PPSslider.value = ppsLimit;
        ppsOutput.innerHTML = "PPS limit: " + ppsLimit;
        depthSlider.value = depth;
        depthOutput.innerHTML = "Depth: " + depth;
    } else {
        showSetting = false;
        menu.style.display = "none";

        controls["DAS"] = parseInt(document.getElementById("DAS").value);
        controls["ARR"] = parseInt(document.getElementById("ARR").value);
        controls["SDARR"] = parseInt(document.getElementById("SDARR").value);

        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);

        save_settings();
    }

    for (let k in controls){
        document.getElementById(k).innerHTML = controls[k];
    }
}

PPSslider.oninput = function() {
    ppsOutput.innerHTML = "PPS limit: " + this.value;
    ppsLimit = parseFloat(this.value);
}

depthSlider.oninput = function() {
    depthOutput.innerHTML = "Depth: " + this.value;
    depth = parseInt(this.value);
}


function init(g){
    g.init();
    g.drawBorder();
    g.state.sevenBag();
    g.state.sevenBag();
    g.state.sevenBag();

    g.state.clearBoard();
    g.state.spawnPiece();
    g.drawActive();
    g.drawQueue();
}

function initCobra(g){
    g.init();
    g.drawBorder();
    g.state.bot = true;
    g.state.sevenBag();
    g.state.sevenBag();
    g.state.sevenBag();
    const queue = g.state.encodeQueue();
    worker.postMessage({type: 'start', board: "", queue: queue});
    g.state.clearBoard();
    g.state.spawnPiece();
    g.drawActive();
    g.drawQueue();
    g.state.heldPiece = g.state.queue.shift();
}


function reset(){
    game.destroy();
    cobra.destroy();

    worker.postMessage({type: 'quit'});

    const seed = Date.now();
    let queueP1 = new PRNG(seed); // Separate seeds for garb and q
    let queueP2 = new PRNG(seed);
    let garbP1 = new PRNG(seed);
    let garbP2 = new PRNG(seed);

    game = new Game(app, queueP1, garbP1);
    cobra = new Game(app2, queueP2, garbP2);


    gameRunning = false;
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
    }
}

function change(button){
    const changeSetting = (e) => {
        e.preventDefault();

        console.log(e.id);

        if (Object.values(controls).includes(e.code)){
            if(e.code === controls[button.name]){
                controls[button.id] = e.code;
                document.getElementById(button.id).innerHTML = e.code;
                document.removeEventListener('keydown', changeSetting); // Remove event listener after the setting has been set
                return;
            }
            document.getElementById(button.id).innerHTML = "That key is already used";

        }
        else{
            controls[button.id] = e.code;
            document.getElementById(button.id).innerHTML = e.code;
            document.removeEventListener('keydown', changeSetting); // Remove event listener after the setting has been set
            return;
        }

    };


    document.getElementById(button.id).innerHTML = controls[button.id];

    document.addEventListener('keydown', changeSetting, false);
    document.getElementById(button.id).innerHTML = "enter something";
    button.blur();
}

function showBot(){
    const bot = document.getElementById('botSettings');
    const player = document.getElementById('playerSettings');
    player.style.display = "none";
    bot.style.display = "block";
}

function showPlayer(){
    const bot = document.getElementById('botSettings');
    const player = document.getElementById('playerSettings');

    bot.style.display = "none";
    player.style.display = "block";
}

function start(){
    if (gameRunning || showSetting) return;
    gameRunning = true;

    init(game);
    initCobra(cobra);

    load_settings();

    targetPPS = ppsLimit;
    playingDepth = depth;

    worker.postMessage({type: 'suggest', depth: 10});
    startTime = performance.now();

    document.addEventListener('keyup', handleKeyUp);

    document.addEventListener('keydown', handleKeyDown);

    gameLoop();
}

function gameLoop(){
    const t1 = performance.now();

    if (!gameRunning) {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        return;
    }

    while(game.state.outgoingGarbage.length > 0){
        let g = game.state.outgoingGarbage.pop();
        cobra.garbageIn(g);
    }

    while (cobra.state.outgoingGarbage.length > 0){
        let g = cobra.state.outgoingGarbage.pop();
        game.garbageIn(g);
    }

    if (!game.state.isValid(game.state.activePiece)) {
        console.warn("Game over");
        gameRunning = false;
    }

    const t2 = performance.now();
    // Every frame, take care of garbage sending, and that's about it i think

    setTimeout(gameLoop, 1000/20 - t2 + t1); // Garbage only sends at 20fps
}

function das(dir, id){
    move(dir);
    setTimeout(() => {
        if (dasID === id){
            arr(dir, id);
        }
    }, controls["DAS"]);
}

function arr(dir, id){
    let loop = setInterval(() => {
        if (dasID === id) move(dir);
        else clearInterval(loop);
    }, controls["ARR"]);

}

function move(dir){
    if (dir === "L") game.moveLeft();
    else if (dir === "R") game.moveRight();
}

function sd(id){
    if (controls["SDARR"] === 0){
        let loop = setInterval(() => {
            if (sdID === id) while (game.moveDown()){}
            else clearInterval(loop);
        }, 1000/60);

    } else {
        let loop = setInterval(() => {
            if (sdID === id) game.moveDown();
            else clearInterval(loop);
        }, controls["SDARR"]);
    }
}

worker.onmessage = (e) => {
    if (gameRunning === false) return;
    if (e.data.value === 0) return;
    if (e.data.type !== 'suggestion') return;

    const move = e.data.move;
    const spin = e.data.spin;

    if (spin !== 1) cobra.state.tspinCheck.rotated = true;

    if (move.location.piece === cobra.state.heldPiece) cobra.hold();

    cobra.state.movePiece(move.location);

    if (!cobra.state.isValid(cobra.state.activePiece)){
        console.warn("Illegal move");
        gameRunning = false;
    }

    let queue = cobra.hardDrop();
    // console.log(queue);

    let t = performance.now() - startTime;
    let duration = ((cobra.state.pieceCount + 1) / targetPPS * 1000) - t;

    setTimeout(() => { // PPS limiter
        if (queue !== ""){
            worker.postMessage({type: 'newpiece', piece: queue});
        }
        worker.postMessage({type: 'suggest', depth: playingDepth});
    }, duration);
}