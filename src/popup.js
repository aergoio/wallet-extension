import "regenerator-runtime/runtime";
import "./assets/style/popup.scss";

import extension from 'extensionizer';
import PortStream from 'extension-port-stream';

import connectToBackground from './utils/connect-background';
import setupVue from './vue/setup';

init();

async function init() {
    const extensionPort = extension.runtime.connect({ name: 'popup' });
    const connectionStream = new PortStream(extensionPort);
    const background = await connectToBackground(connectionStream);
    setupVue({ background });
}