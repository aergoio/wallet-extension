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
                });

                return;


                if (action === 'SIGN') {
                    //const activeAccount = await controller.getActiveAccount();
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

                    controller.permissionRequest('sign', text, async function() {
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
                const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                const formatTxToText = tx => {
                    return Object.keys(tx).map((key) => `${capitalize(key)}: ${JSON.stringify(tx[key], undefined, 2)}`).join("\n");
                };
                if (action === 'SIGN_TX') {
                    const txData = msg.data;
                    const text = `The website at\n\n${port.sender.url}\n\nasks for permission to sign the transaction\n\n${formatTxToText(txData)}\n\nwith your account\n\n${activeAccount.key}`;
                    if (txData.payload_json) {
                        txData.payload = Buffer.from(JSON.stringify(txData.payload_json))
                        delete txData.payload_json;
                    } else if (txData.payload) {
                        txData.payload = Buffer.from(txData.payload_json, 'base64')
                    }
                    controller.permissionRequest('tx_sign', text, async function() {
                        try {
                            const signedTx = await controller.signTransaction({
                                address: activeAccount.data.spec.address,
                                chainId: activeAccount.data.spec.chainId,
                                txData,
                            });
                            port.postMessage({
                                type: 'AERGO_RESPONSE',
                                eventName: 'AERGO_SIGN_TX_RESULT',
                                result: {
                                    account: activeAccount.data.spec,
                                    signature: signedTx.signature
                                }
                            });
                        } catch(e) {
                            console.error(e);
                            alert(e);
                        }
                    });
                }
                if (action === 'SEND_TX') {
                    const txBody = msg.data;
                    const text = `The website at\n\n${port.sender.url}\n\nasks for permission to send the transaction\n\n${formatTxToText(txBody)}\n\nwith your account\n\n${activeAccount.key}`;
                    if (txBody.payload_json) {
                        txBody.payload = Buffer.from(JSON.stringify(txBody.payload_json))
                        delete txBody.payload_json;
                    } else if (txBody.payload) {
                        txBody.payload = Buffer.from(txBody.payload_json, 'base64')
                    }
                    controller.permissionRequest('tx_send', text, async function() {
                        try {
                            const sentTx = await controller.sendTransaction({
                                address: activeAccount.data.spec.address,
                                chainId: activeAccount.data.spec.chainId,
                                txBody,
                            });
                            port.postMessage({
                                type: 'AERGO_RESPONSE',
                                eventName: 'AERGO_SEND_TX_RESULT',
                                result: {
                                    account: activeAccount.data.spec,
                                    hash: sentTx.hash
                                }
                            });
                        } catch(e) {
                            console.error(e);
                            alert(e);
                        }
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
