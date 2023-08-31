importScripts('cobra.js');

function eval(){
    console.warn("Evaluating!")
    return Module.ccall('eval');
}

function init(){
    Module.ccall('init');
}

onmessage = (e) => {
    switch(e.data.type){
        case 'init':
            console.log("initialising");
            init();
            break;
        case 'eval':
            postMessage({type: 'move', value: eval()});
            break;  
    }
}

