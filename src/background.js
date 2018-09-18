import "regenerator-runtime/runtime";

console.log('AERGO Wallet Background Script');

require('./manifest.json');

import BackgroundController from './controllers/background';

import extension from 'extensionizer';
import endOfStream from 'end-of-stream';
import PortStream from 'extension-port-stream';


setupController();

async function setupController() {
    const controller = new BackgroundController();
    extension.runtime.onConnect.addListener(connectRemote);

    function connectRemote (remotePort) {
        const processName = remotePort.name;
        console.log('Establishing connection with', processName);
    
        const portStream = new PortStream(remotePort);
        controller.setupCommunication(portStream);
    
        controller.uiState.popupOpen = true;
        endOfStream(portStream, () => {
            controller.uiState.popupOpen = false;
            console.log('Closed connection with', processName);
        })
    }
}

