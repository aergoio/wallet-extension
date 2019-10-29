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

        if (processName === 'external') {
            // Receive messages from external web pages
            remotePort.onMessage.addListener(async (msg, port) => {
                if (msg.type !== 'AERGO_REQUEST') return;
                console.log('received message', msg, port.sender.url);

                const actions = ['ACTIVE_ACCOUNT', 'SIGN', 'SIGN_TX', 'SEND_TX'];
                const actionsToEventName = {
                    'ACTIVE_ACCOUNT': 'AERGO_ACTIVE_ACCOUNT',
                    'SIGN': 'AERGO_SIGN_RESULT',
                    'SIGN_TX': 'AERGO_SIGN_TX_RESULT',
                    'SEND_TX': 'AERGO_SEND_TX_RESULT',
                }
                const action = msg.action || '';
                if (actions.indexOf(action) === -1) {
                    console.log('message with invalid action type', action);
                }
                controller.permissionRequest(action, msg.data, port.sender.url, (result) => {
                    port.postMessage({
                        type: 'AERGO_RESPONSE',
                        eventName: actionsToEventName[action],
                        result
                    });
                }, () => {
                    port.postMessage({
                        type: 'AERGO_CANCEL',
                        eventName: actionsToEventName[action],
                    });
                });
            });
        } else {
            const portStream = new PortStream(remotePort);
            controller.state.set('active');
            controller.setupCommunication(portStream);
            controller.uiState.popupOpen = true;
            endOfStream(portStream, () => {
                controller.uiState.popupOpen = false;
                console.log('Closed connection with', processName);
                controller.state.set('inactive');
            })
        }

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

if (process.env.NODE_ENV === 'development') {
    extension.tabs.create({url : "tab.html"});
}
