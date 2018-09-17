import "regenerator-runtime/runtime";
require('./assets/style/popup.scss');

import extension from 'extensionizer';
import PortStream from 'extension-port-stream';

import setupVue from './vue/setup';
import connectToBackground from './utils/connect-background';

import { promisifySimple } from './utils/promisify';

init();
async function init() {
    const extensionPort = extension.runtime.connect({ name: 'popup' });
    const connectionStream = new PortStream(extensionPort);
    const background = await connectToBackground(connectionStream);
    setupVue({ background });

    console.log('connected to bg', background);
    const result = await promisifySimple(background.foo)('bar');
    console.log('bg result', result);
}