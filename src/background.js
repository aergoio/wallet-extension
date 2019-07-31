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
                    const activeAccount = await controller.getActiveAccount();
                    if (!activeAccount) {
                        const text = `The website at\n\n${port.sender.url}\n\n` +
                            `asks for permission to access your active account.\n\n`+
                            `You have no active account. Make sure to select an account inside Aergo Connect.`;
                        alert(text);
                        return;
                    }
                    const text = `The website at\n\n${port.sender.url}\n\nasks for permission to access your active account\n\n${activeAccount.key}`;
                    controller.permissionRequest(text, function() {
                        port.postMessage({
                            type: 'AERGO_RESPONSE',
                            eventName: 'AERGO_ACTIVE_ACCOUNT',
                            result: {
                                account: activeAccount.data.spec
                            }
                        });
                    })
                }
                if (action === 'SIGN') {
                    const activeAccount = await controller.getActiveAccount();
                    const input = msg.data.hash;
                    const text = `The website at\n\n${port.sender.url}\n\nasks for permission to sign the message\n\n${input}\n\nwith your account\n\n${activeAccount.key}`;
                    let signMessage = input;
                    if (input.substr(0, 2) === '0x') {
                        try {
                            signMessage = Buffer.from(input.substr(2), "hex");
                        } catch (e) {
                            console.error(e);
                            return;
                        }
                    }

                    controller.permissionRequest(text, async function() {
                        port.postMessage({
                            type: 'AERGO_RESPONSE',
                            eventName: 'AERGO_SIGN_RESULT',
                            result: {
                                account: activeAccount.data.spec,
                                signature: await controller.signMessage({
                                    address: activeAccount.data.spec.address,
                                    chainId: activeAccount.data.spec.chainId,
                                    message: signMessage,
                                })
                            }
                        });
                    });
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
