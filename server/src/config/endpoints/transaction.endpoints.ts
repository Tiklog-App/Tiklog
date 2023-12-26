import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    addToWalletHandler,
    fetchPaymentRequestHandler,
    getCustomerTransactionsHandler,
    getCustomerWalletHandler,
    getRiderTransactionsHandler,
    getRiderWalletHandler,
    getTransactionByRefHandler,
    getTransactionsHandler,
    initTransactionCallbackHandler,
    makePaymentHandler,
    mobileTransactionAddToWalletHandler,
    requestPaymentHandler,
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
        name: 'get rider transactions',
        method: 'get',
        path: '/transactions/rider',
        handler: getRiderTransactionsHandler
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
    },
    {
        name: 'get rider wallet',
        method: 'get',
        path: '/rider-wallet',
        handler: getRiderWalletHandler
    },
    {
        name: 'payment request',
        method: 'post',
        path: '/request-payment',
        handler: requestPaymentHandler
    },
    {
        name: 'make payment',
        method: 'post',
        path: '/make-payment/:riderId',
        handler: makePaymentHandler
    },
    {
        name: 'fetch payment request',
        method: 'get',
        path: '/fetch-payment-requests',
        handler: fetchPaymentRequestHandler
    },
    {
        name: 'mobile transaction add to wallet',
        method: 'post',
        path: '/transaction/add-to-wallet-mobile',
        handler: mobileTransactionAddToWalletHandler
    }
];

export default transactionEndpoints;