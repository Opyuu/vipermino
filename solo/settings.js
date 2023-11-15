
function toggleSetting(){
    if (!showSetting){
        showSetting = true;
        menu.style.display = "block";
        document.getElementById("wait").style.display = "none";

    }
    else{
        showSetting = false;
        menu.style.display = "none";
        testFumen();
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
    game.state.queue = [];
    for (let char of queue){
        game.state.queue.push(PIECE_CHAR.indexOf(char));
    }
    game.state.sevenBag();
    game.state.sevenBag();
    game.state.sevenBag();

}

function testFumen(){
    if (gameRunning) return;

    let testBoard = [];

    for (let col = 0; col < 10; col++){
        testBoard[col] = [];

        for (let row = 0; row < 40; row++){
            testBoard[col][row] = {'type': 0};
        }
    }

    fumen = fumenInput.value;

    try{
        parseFumen(fumen, testBoard);
    } catch(err){
        fumen = "";
        alert("Invalid fumen");
        showSetting = true;
        menu.style.display = "block";
    }
}

function parseFumen(fumen, board){
    if (fumen === "") {
        return;
    }

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
            board[x][y].type = FUMEN_PIECE[pieceType];
        }
        minoCounter = minoCounter + pieceCount;
    }
}

// Update the current slider value (each time you drag the slider handle)
PPSslider.oninput = function() {
    if (this.value === "15"){
        ppsOutput.innerHTML = "PPS limit: Uncapped";
        ppsLimit = 100;
    }
    else{
        ppsOutput.innerHTML = "PPS limit: " + this.value;
        ppsLimit = parseInt(this.value);
    }
}

depthSlider.oninput = function() {
    depthOutput.innerHTML = "Depth: " + this.value;
    depth = parseInt(this.value);
}


function an(){
    document.body.style.backgroundColor = '#00bbdc';
}
