# AERGO Wallet (Browser extension)

This is the source code for the official AERGO Wallet browser extension. It works with Chrome and Firefox.

## Install

1. `git clone https://github.com/aergoio/wallet-extension`
2. Go to [chrome://extensions/](chrome://extensions/).
3. Enable "Developer mode". Click "Load Unpacked".
4. Navigate to the `dist` directory and click OK.

### Update

1. `git pull`
2. Go to [chrome://extensions/](chrome://extensions/).
3. Click the "Reload" button.

## Develop

`npm run start` starts webpack in watch mode and also reloads the Chrome extension after every build.

`npm run start2` starts webpack in watch mode with the webpack's devserver. You can access the wallet at `http://localhost:8080/dist/popup.html` and code will auto-reload. Browser extension features won't work in this mode. This script will likely be removed in the future. It's not very useful except for quickly testing CSS changes.

`npm run build` builds everything for distribution. Please do commit the `dist` directory to the repository, that way people can test the extension without building themselves.