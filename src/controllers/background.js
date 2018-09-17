import {EventEmitter} from 'events';
import pump from 'pump';
import Dnode from 'dnode/browser.js';
import AergoClient from 'herajs';

class BackgroundController extends EventEmitter {
    constructor() {
        super();
        this.uiState = {
            popupOpen: false
        }
        this.aergo = new AergoClient();
    }

    isUiOpen() {
        return this.uiState.popupOpen;
    }

    setupCommunication (outStream) {
        // Setup simple async rpc stream to popup
        const dnode = Dnode({
            foo: (param, send) => {
                send({msg: 'bar', param});
            },
            getAccounts: (send) => {
                this.aergo.accounts.get().then(addresses => {
                    const accounts = addresses.map(address => ({address}));
                    send(accounts);
                });
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