importScripts('cobra.js');

function eval(q){
    return Module.ccall('eval', 'number', ['number'], [q]);
}

function init(q1, q2, q3){
    Module.ccall('init', null, ['number', 'number', 'number'], [q1, q2, q3]);
}

onmessage = (e) => {
    switch(e.data.type){
        case 'init':
            console.log("initialising");
            init(e.data.v1, e.data.v2, e.data.v3);
            break;
        case 'eval':
            let t1 = performance.now();
            let data = eval(e.data.q);
            let t2 = performance.now();
            let timetaken = t2 - t1;
            postMessage({type: 'move', value: data, time: timetaken})
            // postMessage({type: 'move', value: eval(e.data.q)});
            break;  
        case 'kill':
            Module.ccall('kill'); // Frees game memory
            break;
    }
}

