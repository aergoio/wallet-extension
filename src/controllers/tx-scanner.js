import { Address } from '@herajs/client';
import { Transaction } from '@herajs/wallet';

/**
 * This is a data source for transactionManager.getAccountTransactions.
 * It uses the Aergoscan API which is experimental and subject to change.
 * It is not recommended to use this data source.
 */
export class AergoscanTransactionScanner {
    fetchAccountTransactionsAfter(wallet) {
        return (next) => async ({ account, blockno, limit }) => {
            const chainId = account.data.spec.chainId
            if (chainId !== 'testnet.aergo.io' && chainId !== 'aergo.io') {
                return next({ account, blockno, limit });
            }
            let baseUrl;
            if (chainId == 'testnet.aergo.io') {
                baseUrl = 'https://api.aergoscan.io/testnet';
            }
            if (chainId == 'aergo.io') {
                baseUrl = 'https://api.aergoscan.io/main';
            }
            const address = new Address(account.data.spec.address);
            console.log(`[track account] Fetching txs for ${address} on ${chainId} since ${blockno}...`);
            const q = encodeURIComponent(`(from:${address} OR to:${address}) AND blockno:>${blockno}`);
            
            const size = 1000;
            const offset = 0;
            const url = `${baseUrl}/transactions?q=${q}&sort=blockno:desc&size=${size}&from=${offset}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(`[track account] Got ${data.hits.length} (of ${data.total}) txs for ${address} since ${blockno}.`);
            return data.hits.map(tx => new Transaction(tx.hash, {
                chainId,
                from: tx.meta.from,
                to: tx.meta.to,
                hash: tx.hash,
                ts: tx.meta.ts,
                blockhash: '', // TODO: remove or add?
                blockno: tx.meta.blockno,
                amount: tx.meta.amount,
                type: tx.meta.type,
                status: Transaction.Status.Confirmed
            }));
        };
    }

    fetchAccountTransactions(wallet) {
        return () => async (account) => {
            const accountSpec = wallet.accountManager.getCompleteAccountSpec(account.data.spec);
            const { bestHeight } = await wallet.getClient(accountSpec.chainId).blockchain();
            return this.fetchAccountTransactionsBefore(wallet)(async () => [])({ account, blockno: bestHeight });
        };
    }
}