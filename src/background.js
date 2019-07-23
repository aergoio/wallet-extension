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
                const action = msg.action || '';
                if (action === 'ACTIVE_ACCOUNT') {
                    const activeAccountAddress = await controller.getActiveAccount();
                    const confirmed = confirm(`Do you want to grant the website at ${port.sender.url} access to your active account address ${activeAccountAddress.key}?`);
                    if (confirmed) {
                        port.postMessage({
                            type: 'AERGO_RESPONSE',
                            eventName: 'AERGO_ACTIVE_ACCOUNT',
                            result: {
                                account: activeAccountAddress.data.spec
                            }
                        });
                    }
                }
                if (action === 'SIGN') {
                    const activeAccountAddress = await controller.getActiveAccount();
                    const confirmed = confirm(`The website at ${port.sender.url} asks for permission to sign the message x with your account ${activeAccountAddress.key}.`);
                    if (confirmed) {
                        port.postMessage({
                            type: 'AERGO_RESPONSE',
                            eventName: 'AERGO_SIGN_RESULT',
                            result: {
                                account: activeAccountAddress.data.spec,
                                signature: 'xxx'
                            }
                        });
                    }
                }
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
