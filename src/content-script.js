const port = chrome.runtime.connect({ name: 'external' });

window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "AERGO_REQUEST")) {
        console.log("[Contentscript] Received message from website", event.data);
        port.postMessage(event.data);
    }
});

port.onMessage.addListener((msg) => {
    if (msg.type !== 'AERGO_RESPONSE' && msg.type !== 'AERGO_CANCEL') return;
    console.log('[Contentscript] Received message from extension', msg);
    let eventName = msg.eventName;
    if (msg.type === 'AERGO_CANCEL') eventName = eventName + '_CANCEL';
    const event = new CustomEvent(eventName, { detail: msg.result });
    window.dispatchEvent(event);
});