import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import { 
    changeCustomerPasswordHandler,
    checkRedisKey,
    deleteCustomerHandler,
    resetCustomerPasswordHandler,
    saveCustomerPasswordHandler,
    updateCustomerHandler,
    updateCustomerStatusHandler,
    getCustomersHandler,
    getCustomerHandler,
    saveCustomerAddressHandler,
    getCustomerAddressesHandler,
    getSingleCustomerAddressHandler,
    updateCustomerAddressHandler,
    deleteCustomerAddressHandler
} from '../../routes/customerRoute';

 const customerEndpoints: RouteEndpoints = [
    {
        name: 'update customer',
        method: 'put',
        path: '/customer-update/:customerId',
        handler: updateCustomerHandler
    },
    {
        name: 'update customer status',
        method: 'put',
        path: '/customer-status-update/:customerId',
        handler: updateCustomerStatusHandler
    },
    {
        name: 'delete customer',
        method: 'delete',
        path: '/delete-customer/:customerId',
        handler: deleteCustomerHandler
    },
    {
        name: 'change customer password',
        method: 'put',
        path: '/change-customer-password/:customerId',
        handler: changeCustomerPasswordHandler
    },
    {
        name: 'check redis key',
        method: 'get',
        path: '/check-redis-key-customer/:customerId',
        handler: checkRedisKey
    },
    {
        name: 'save customer password',
        method: 'put',
        path: '/password-reset/save-password/:customerId',
        handler: saveCustomerPasswordHandler
    },
    {
        name: 'reset customer password',
        method: 'get',
        path: '/password-reset-customer',
        handler: resetCustomerPasswordHandler
    },
    {
        name: 'fetch customers',
        method: 'get',
        path: '/customers',
        handler: getCustomersHandler
    },
    {
        name: 'get customer',
        method: 'get',
        path: '/customer/:customerId',
        handler: getCustomerHandler
    },
    {
        name: 'save customer address',
        method: 'post',
        path: '/customer-address',
        handler: saveCustomerAddressHandler
    },
    {
        name: 'get customer addresses',
        method: 'get',
        path: '/customer-addresses',
        handler: getCustomerAddressesHandler
    },
    {
        name: 'get customer address',
        method: 'get',
        path: '/customer-address/:id',
        handler: getSingleCustomerAddressHandler
    },
    {
        name: 'update customer address',
        method: 'put',
        path: '/customer-address/:id',
        handler: updateCustomerAddressHandler
    },
    {
        name: 'delete customer address',
        method: 'delete',
        path: '/customer-address/:id',
        handler: deleteCustomerAddressHandler
    }
];

export default customerEndpoints;