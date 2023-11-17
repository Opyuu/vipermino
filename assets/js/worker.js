importScripts('cobra.js');

onmessage = (e) => {
    const message = JSON.stringify(e.data);
    let v = Module.ccall('communicate', 'number', ['string'], [message]);
}