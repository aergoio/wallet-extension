# Aergo Connect (wallet browser extension)

**Beta version under active testing: use at your own risk!**

This is the source code for the official Aergo Wallet browser extension. It's developed and tested with Chrome.

## Install development version

1. `git clone https://github.com/aergoio/wallet-extension`
2. Go to [chrome://extensions/](chrome://extensions/).
3. Enable "Developer mode". Click "Load Unpacked".
4. Navigate to the `dist` directory and click OK.

### Update

1. Change your terminal to the `wallet-extension` directory
2. `git pull`
3. Go to [chrome://extensions/](chrome://extensions/).
4. Click the "Reload" button.

## Develop

1. `npm install` to install dependencies.

2. `npm run start` starts webpack in watch mode and also reloads the Chrome extension after every build.

3. Add the extension to Chrome following to the Install development version steps above.

4. `npm run build` builds everything for distribution. Please do commit the `dist` directory to the repository, that way people can test the extension without building it by themself.