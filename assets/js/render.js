function drawActive(g){
    g.app.stage.removeChild(g.activeGraphics);
    g.activeGraphics.clear();
    g.state.drawShadow(g.activeGraphics);
    g.state.drawActive(g.activeGraphics);
    g.app.stage.addChild(g.activeGraphics);

}

function drawBoard(g){
    g.app.stage.removeChild(g.boardGraphics);
    g.boardGraphics.clear();
    g.state.drawBoard(g.boardGraphics);
    g.app.stage.addChild(g.boardGraphics);
}


function drawBorder(g){
    g.app.stage.removeChild(g.borderGraphics);

    // Board border
    let offset = (BORDER_SIZE/BLOCK_SIZE) / 2;
    g.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
    g.borderGraphics.moveTo(-offset + 7, RENDER_ROWS + offset);
    g.borderGraphics.lineTo(-offset + 7, 4);
    g.borderGraphics.moveTo(-offset * 2 + 7, RENDER_ROWS + offset);
    g.borderGraphics.lineTo(COLS + offset * 2 + 7, RENDER_ROWS + offset);
    g.borderGraphics.moveTo(COLS + offset + 7, RENDER_ROWS + offset);
    g.borderGraphics.lineTo(COLS + offset + 7, 4);
    g.borderGraphics.endFill();

    g.borderGraphics.lineStyle(GRID_SIZE/BLOCK_SIZE, GRID_COLOUR);

    // Grids
    for (let i = 1; i < COLS; i++){
        g.borderGraphics.moveTo(i + 7, 4);
        g.borderGraphics.lineTo(i + 7, RENDER_ROWS);
    }
    for (let j = RENDER_ROWS - 1; j > 3; j--){
        g.borderGraphics.moveTo(7, j);
        g.borderGraphics.lineTo(17, j);
    }
    g.borderGraphics.endFill();

    // Hold border
    g.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
    g.borderGraphics.moveTo(0, 4);
    g.borderGraphics.lineTo(6, 4);
    g.borderGraphics.moveTo(6, 8);
    g.borderGraphics.lineTo(0, 8);
    g.borderGraphics.moveTo(offset, 8);
    g.borderGraphics.lineTo(offset, 4);
    g.borderGraphics.endFill();

    // Queue border
    g.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
    g.borderGraphics.moveTo(17, 4);
    g.borderGraphics.lineTo(23, 4);
    g.borderGraphics.moveTo(23 - offset, 4);
    g.borderGraphics.lineTo(23 - offset, 20);
    g.borderGraphics.moveTo(23, 20);
    g.borderGraphics.lineTo(17, 20);
    g.app.stage.addChild(g.borderGraphics);

    // Garbage border
    g.borderGraphics.lineStyle(BORDER_SIZE/BLOCK_SIZE, BORDER_COLOUR);
    g.borderGraphics.moveTo(6, 4 - offset);
    g.borderGraphics.lineTo(6, 24 + offset);
    g.borderGraphics.moveTo(6 - offset, 24 + offset);
    g.borderGraphics.lineTo(7, 24 + offset);
    g.borderGraphics.moveTo(7 - offset, 4 - offset);
    g.borderGraphics.lineTo(7 - offset, 5);
}

function drawQueue(g){
    g.app.stage.removeChild(g.queueGraphics);
    g.queueGraphics.clear();
    g.state.drawQueue(g.queueGraphics);
    g.app.stage.addChild(g.queueGraphics);
}

function drawHold(g){
    g.app.stage.removeChild(g.holdGraphics);
    g.holdGraphics.clear();
    g.state.drawHold(g.holdGraphics, g.canHold);
    g.app.stage.addChild(g.holdGraphics);
}

function drawGarbage(g){
    g.app.stage.removeChild(g.garbageGraphics);
    g.garbageGraphics.clear();
    g.state.drawGarbage(g.garbageGraphics);
    g.app.stage.addChild(g.garbageGraphics);
}

function drawStats(g, timeElapsed){
    let pps = g.state.stats.pieceCount / timeElapsed * 1000;
    let apm = g.state.stats.attack / timeElapsed * 1000 * 60;
    let vs = (g.state.stats.attack + g.state.stats.garbageCleared) / g.state.stats.pieceCount * pps * 100;

    vs = isNaN(vs) ? 0 : vs;

    g.app.stage.removeChild(g.statsText);
    g.statsText = new PIXI.Text(
        `${g.state.stats.pieceCount} | ${pps.toFixed(2)} PPS
${g.state.stats.attack} | ${apm.toFixed(2)} APM
${vs.toFixed(2)} VS`, {font:"50px Monospace", fill:"white"});
    g.statsText.x = 17.5 * BLOCK_SIZE;
    g.statsText.y = 20.5 * BLOCK_SIZE;
    g.app.stage.addChild(g.statsText);
}