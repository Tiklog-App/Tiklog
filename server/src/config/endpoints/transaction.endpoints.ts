import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    addToWalletHandler,
    getCustomerTransactionsHandler,
    getTransactionsHandler,
    initTransactionCallbackHandler,
    updateTransactionHandler
} from '../../routes/TransactionRoute';

const transactionEndpoints: RouteEndpoints = [
    {
        name: 'add to wallet',
        method: 'post',
        path: '/transactions/add-to-wallet',
        handler: addToWalletHandler
    },
    {
        name: 'paystack init transaction callback',
        method: 'get',
        path: '/transactions/initialize',
        handler: initTransactionCallbackHandler
    },
    {
        name: 'update transaction',
        method: 'patch',
        path: '/transactions',
        handler: updateTransactionHandler
    },
    {
        name: 'get customer transactions',
        method: 'get',
        path: '/transactions/customer',
        handler: getCustomerTransactionsHandler
    },
    {
        name: 'get transactions',
        method: 'get',
        path: '/transactions',
        handler: getTransactionsHandler
    }
];

export default transactionEndpoints;