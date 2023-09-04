const COLS = 10;
const ROWS = 40;
const RENDER_ROWS = 24;
const SPAWNROW = 23;

const BLOCK_SIZE = 30;
const BORDER_SIZE = 5;
const GRID_SIZE = 1;

const BACKGROUND_COLOUR = "#000000";
const PIECE_COLOUR = ["#000000", "#00FFE1", "#FFEA00", "#B300FF", "#FF8800" , "#0008FF", "#00FF15", "#FF000D", "#8F8F8F"];
const SHADOW_COLOUR = ["rgba(0, 0, 0, 1)", "rgba(0, 255, 225, 0.5)", "rgba(255, 234, 0, 0.5)", "rgba(175, 0, 255, 0.5)", "rgba(255, 136, 0, 0.5)" , "rgba(0, 8, 255, 0.5)", "rgba(0, 255, 21, 0.5)", "rgba(255, 0, 13, 0.5)", "#8F8F8F"]
const PIECE_CHAR = ['-', 'I', 'O', 'T', 'L', 'J', 'S', 'Z'];

const FPS_DELTA = 1000/60;
const PIECES = [1, 2, 3, 4, 5, 6, 7];