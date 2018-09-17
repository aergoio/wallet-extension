import Dnode from 'dnode/browser.js';
import { EventEmitter } from 'events';

export default function connectToBackground (connectionStream) {
    // Setup simple async rpc stream to background
    return new Promise((resolve, reject) => {
        console.log('connecting to background...');

        var eventEmitter = new EventEmitter();
        var dnode = Dnode({
            sendUpdate: function (state) {
                // Receive update from background
                eventEmitter.emit('update', state)
            },
        })
        connectionStream.pipe(dnode).pipe(connectionStream);
        dnode.once('remote', function (backgroundManager) {
            console.log('connected to remote');
            backgroundManager.on = eventEmitter.on.bind(eventEmitter);
            resolve(backgroundManager);
        });
    });
}