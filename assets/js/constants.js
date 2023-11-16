const ATTACK_TABLE = [
    [0, 0, 1, 2, 4],
    [0, 0, 1, 2, 4],
    [0, 2, 4, 6, 8]
]; // [TSPIN][CLEAR]

const COLS = 10;
const ROWS = 40;
const RENDER_ROWS = 24;
const SPAWNROW = 23;

const BLOCK_SIZE = 32;
const BORDER_SIZE = 6;
const GRID_SIZE = 2;

const BACKGROUND_COLOUR = "#000000";
const PIECE_COLOUR = [0x000000, 0x00FFE1, 0xFFEA00, 0xB300FF, 0xFF8800, 0x0008FF, 0x00FF15, 0xFF000D, 0x8F8F8F];
const LINECLEAR_COLOUR = 0xFFFFFF;
const PIECE_CHAR = ['-', 'I', 'O', 'T', 'L', 'J', 'S', 'Z'];
const PIECES = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
const FUMEN_PIECE = [0, 1, 4, 2, 7, 3, 5, 6, 8];
const GRID_COLOUR = 0x001e82;
const BORDER_COLOUR = 0xFFFFFF;
const SHADOW_TEXTURE = [];
const PV_TEXTURE = [];
const PIECE_TEXTURE = [];
const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const CONNECTED_TEXTURES = [];

for(let piece = 0; piece < 8; piece++){
    const baseConnectedTexture = PIXI.Texture.from('/vipermino/assets/sprites/connected.png')
    CONNECTED_TEXTURES[piece + 1] = [];
    for (let mino = 0; mino < 4; mino++){
        const show = new PIXI.Rectangle(piece * BLOCK_SIZE, mino * BLOCK_SIZE, 32, 32);
        CONNECTED_TEXTURES[piece + 1][mino] = new PIXI.Texture(baseConnectedTexture, show);
    }
}


const scalingMatrix = new PIXI.Matrix();
scalingMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);

const FPS_DELTA = 1000/60;

let baseShadowTexture = PIXI.Texture.from('/vipermino/assets/sprites/shadowsprites.png')
let basePieceTexture = PIXI.Texture.from('/vipermino/assets/sprites/piecesprite.png')

for(let i = 0; i < 8; i++){
    const show = new PIXI.Rectangle(i * 32, 0, 32, 32);
    let texture = new PIXI.Texture(baseShadowTexture, show);
    SHADOW_TEXTURE.push(texture);
}

for(let i = 0; i <= 8; i++){
    const show = new PIXI.Rectangle(i * BLOCK_SIZE, 0, 32, 32);
    let texture = new PIXI.Texture(basePieceTexture, show);
    PIECE_TEXTURE.push(texture);
}

for (let i = 0; i < 8; i++){
    const baseTexture = PIXI.Texture.from('/vipermino/assets/sprites/connectedshadow.png');
    PV_TEXTURE[i + 1] = [];
    for (let mino = 0; mino < 4; mino++){
        const show = new PIXI.Rectangle(i * BLOCK_SIZE, mino * BLOCK_SIZE, 32, 32);
        PV_TEXTURE[i + 1][mino] = new PIXI.Texture(baseTexture, show);
    }
}

const tetrioAttackTable = {
    SINGLE: 0,
    DOUBLE: 1,
    TRIPLE: 2,
    QUAD: 4,
    TSPIN_MINI: 0,
    TSPIN: 0,
    TSPIN_MINI_SINGLE: 0,
    TSPIN_SINGLE: 2,
    TSPIN_MINI_DOUBLE: 1,
    TSPIN_DOUBLE: 4,
    TSPIN_TRIPLE: 6,
    TSPIN_QUAD: 10,
    BACKTOBACK_BONUS: 1,
    BACKTOBACK_BONUS_LOG: 0.8,
    COMBO_MINIFIER: 1,
    COMBO_MINIFIER_LOG: 1.25,
    COMBO_BONUS: 0.25,
    ALL_CLEAR: 10,
}