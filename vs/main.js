let leftDown = false;
let rightDown = false;
let dasID = 0;
let sdID = 0;
let keys = [];
let gameRunning = false;

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
    width: (10 + 12) * 32,
    height: 25 * 32,
    antialias: true,
    resolution: 1
});

document.getElementById('board').appendChild(app.view);

let game = new Game(app);


function start(){
    if (gameRunning) return;
    gameRunning = true;
    game.init();
    game.drawBorder();
    game.state.sevenBag();
    game.state.clearBoard();
    game.state.spawnPiece();
    game.drawActive();
    game.drawQueue();

    document.addEventListener('keyup', (event) =>{
        keys[event.code] = false;
        switch (event.code){
            case controls["Move_Left"]:
                dasID++;
                break;

            case controls["Move_Right"]:
                dasID++;
                break;

            case controls["Move_Down"]:
                sdID++;
                break;
        }
    });

    document.addEventListener('keydown', (event) =>{
        if (event.repeat) return;

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

            case controls["Rotate_CCW"]:
                game.rotateCCW();
                break;

            case controls["Hold"]:
                game.hold();
                break;

            case controls["Move_Down"]:
                sdID++;
                sd(sdID);
                break;
        }
    });

    gameLoop();
}

function gameLoop(){

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