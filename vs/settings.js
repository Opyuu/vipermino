function change(button){
    const changeSetting = (e) => {
        e.preventDefault();

        console.log(e.id);

        controls[button.id] = e.code;
        document.getElementById(button.id).innerHTML = e.code;
        document.removeEventListener('keydown', changeSetting); // Remove event listener after the setting has been set
        button.blur();
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

        controls["DAS"] = document.getElementById("DAS").value;
        controls["ARR"] = document.getElementById("ARR").value;
        controls["SDARR"] = document.getElementById("SDARR").value;

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