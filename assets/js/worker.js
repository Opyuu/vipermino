importScripts('cobra.js');

onmessage = (e) => {
    const message = JSON.stringify(e.data);
    Module.ccall('communicate', 'number', ['string'], [message]);
}
