import Lockscreen from '../vue/pages/Lockscreen.vue';
import Accounts from '../vue/pages/Accounts.vue';
import Account from '../vue/pages/Account.vue';
import Deposit from '../vue/pages/Deposit.vue';
import Send from '../vue/pages/Send.vue';
import Sign from '../vue/pages/Sign.vue';
import History from '../vue/pages/History.vue';
import AddAccount from '../vue/pages/AddAccount.vue';
import CreateAccount from '../vue/pages/CreateAccount.vue';
import ImportAccount from '../vue/pages/ImportAccount.vue';
import Reset from '../vue/pages/Reset.vue';
import ExportAccount from '../vue/pages/ExportAccount.vue';
import RemoveAccount from '../vue/pages/RemoveAccount.vue';

export default [
    { path: '/locked', component: Lockscreen, meta: { transitionName: 'fade' }, },
    { path: '/reset', component: Reset, meta: { transitionName: 'fade' }, },
    { path: '/', component: Accounts, meta: { transitionName: 'slide-vertical' }, },
    { path: '/add-account/', component: AddAccount, meta: { transitionName: 'slide-vertical' }, },
    { path: '/add-account/create/', component: CreateAccount, meta: { transitionName: 'slide-vertical' }, },
    { path: '/add-account/import/', component: ImportAccount, meta: { transitionName: 'slide-vertical' }, },
    { path: '/account/:address/', component: Account, meta: { transitionName: 'slide-vertical' },
        children: [
            { path: '', component: Deposit, meta: { transitionName: 'slide', index: 1 } },
            { path: 'send', component: Send, meta: { transitionName: 'slide', index: 2 } },
            { path: 'sign', component: Sign, meta: { transitionName: 'sign', index: 3 } },
            { path: 'history', component: History, meta: { transitionName: 'slide', index: 4 } },
            { path: 'export', component: ExportAccount, meta: { transitionName: 'slide' } },
            { path: 'remove', component: RemoveAccount, meta: { transitionName: 'slide' } },
        ]
    },
];