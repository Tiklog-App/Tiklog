import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    addToWalletHandler,
    getCustomerTransactionsHandler,
    getCustomerWalletHandler,
    getTransactionByRefHandler,
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
        path: '/transaction/initialize',
        handler: initTransactionCallbackHandler
    },
    {
        name: 'update transaction',
        method: 'put',
        path: '/update-transactions',
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
    },
    {
        name: 'get transaction by ref',
        method: 'post',
        path: '/transaction-ref',
        handler: getTransactionByRefHandler
    },
    {
        name: 'get customer wallet',
        method: 'get',
        path: '/customer-wallet',
        handler: getCustomerWalletHandler
    }
];

export default transactionEndpoints;