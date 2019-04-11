export const CHAINS = {
    'aergo.io': {
        apiUrl: 'https://api.aergoscan.io/main',
        explorerUrl: 'https://mainnet-74909.aergoscan.io',
        nodeUrl: 'http://main.aergo.io:7845'
    },
    'testnet.aergo.io': {
        apiUrl: 'https://api.aergoscan.io/testnet',
        explorerUrl: 'https://testnet.aergoscan.io',
        nodeUrl: 'http://testnet.aergo.io:7845'
    },
};

export const DEFAULT_CHAIN = 'aergo.io';

export function chainProvider(chainId) {
    let chainConfig = CHAINS[chainId];
    if (typeof chainConfig === 'undefined') chainConfig = CHAINS[DEFAULT_CHAIN];
    return {
        apiUrl: path => `${chainConfig.apiUrl}${path}`,
        explorerUrl: path => `${chainConfig.explorerUrl}${path}`,
        nodeUrl: chainConfig.nodeUrl,
    };
};