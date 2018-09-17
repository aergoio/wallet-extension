import {EventEmitter} from 'events';
import pump from 'pump';
import Dnode from 'dnode/browser.js';

class BackgroundController extends EventEmitter {
    constructor() {
        super();
        this.uiState = {
            popupOpen: false
        }
    }

    isUiOpen() {
        return this.uiState.popupOpen;
    }

    setupCommunication (outStream) {
        // Setup simple async rpc stream to popup
        const dnode = Dnode({
            foo: (param, send) => {
                send({msg: 'bar', param});
            }
        })
        pump(
            outStream,
            dnode,
            outStream,
            (err) => {
                if (err) log.error(err);
            }
        );
        dnode.on('remote', (remote) => {
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', sendUpdate)
        });

        /*setInterval(() => {
            this.emit('update', 'something');
        }, 1000)*/
    }
}

export default BackgroundController;