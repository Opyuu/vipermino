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
const PIECE_TEXTURE = [];
const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const scalingMatrix = new PIXI.Matrix();
scalingMatrix.scale(1/BLOCK_SIZE, 1/BLOCK_SIZE);

const FPS_DELTA = 1000/60;

let baseShadowTexture = PIXI.Texture.from('../assets/sprites/shadowsprites.png')
let basePieceTexture = PIXI.Texture.from('../assets/sprites/piecesprite.png')

for(let i = 0; i < 8; i++){
    const show = new PIXI.Rectangle(i * BLOCK_SIZE, 0, 32, 32);
    let texture = new PIXI.Texture(baseShadowTexture, show);
    SHADOW_TEXTURE.push(texture);
}

for(let i = 0; i <= 8; i++){
    const show = new PIXI.Rectangle(i * BLOCK_SIZE, 0, 32, 32);
    let texture = new PIXI.Texture(basePieceTexture, show);
    PIECE_TEXTURE.push(texture);
}
