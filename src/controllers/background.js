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
            getAccounts: async (send) => {
                const addresses = await this.aergo.accounts.get();
                const accounts = addresses.map(address => ({address}));
                send(accounts);
            },
            createAccount: async ({ name, password }, send) => {
                const createdAddress = await this.aergo.accounts.create('testpass');
                send({address: createdAddress});
            },
            sendTransaction: async (tx, send) => {
                await this.aergo.accounts.unlock(tx.from, 'testpass');
                tx.nonce = 1 + await this.aergo.getNonce(tx.from);
                const signedTx = await this.aergo.accounts.signTransaction(tx);
                const txHash = await this.aergo.sendSignedTransaction(signedTx);
                send(txHash);
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