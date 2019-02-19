import "regenerator-runtime/runtime";

require('./manifest.json');

import extension from 'extensionizer';
import endOfStream from 'end-of-stream';
import PortStream from 'extension-port-stream';

import BackgroundController from './controllers/background';

console.log('AERGO Wallet Background Script');
console.log('Extension ID', extension.runtime.id);


setupController();

async function setupController() {
    const controller = new BackgroundController();
    extension.runtime.onConnect.addListener(connectRemote);    

    function connectRemote (remotePort) {
        const processName = remotePort.name;
        console.log('Establishing connection with', processName);

        controller.state.set('active');
    
        const portStream = new PortStream(remotePort);
        controller.setupCommunication(portStream);
    
        controller.uiState.popupOpen = true;
        endOfStream(portStream, () => {
            controller.uiState.popupOpen = false;
            console.log('Closed connection with', processName);
            controller.state.set('inactive');
        })

        /*

        const notifId = '';
        extension.notifications.create(
            notifId,
            {
                type: 'basic',
                title: 'Aergo Wallet',
                iconUrl: extension.extension.getURL('0da81dee4755822e45e812c8ce30d733.png'),
                message: `Hello from the Wallet! Established connection with ${processName}. Yes.`,
            }
        );
        extension.notifications.onClicked.addListener((url) => {
            if (!txId.startsWith('http')) return;
            console.log('clicked on', e);
            extension.tabs.create({ url });
        });

        */
    }
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    title: "Open full page",
    contexts: ["browser_action"],
    onclick: function() {
        extension.tabs.create({url : "tab.html"});
    }
});

extension.tabs.create({url : "tab.html"});

