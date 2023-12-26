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
    deleteCustomerAddressHandler,
    editCustomerProfileHandler,
    customerPasswordResetCodeHandler,
    getUserChatsHandler,
    deleteChatsHandler,
    createChatHandler,
    findUserChatsHandler,
    findChatHandler,
    createChatMessageHandler,
    getChatMessagesHandler,
    getUsersWithIdsHandler,
    ratingHandler
} from '../../routes/customerRoute';

 const customerEndpoints: RouteEndpoints = [
    {
        name: 'update customer',
        method: 'put',
        path: '/customer-update/:customerId',
        handler: updateCustomerHandler
    },
    {
        name: 'edit customer profile',
        method: 'put',
        path: '/edit-customer-profile/:customerId',
        handler: editCustomerProfileHandler
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
        path: '/password-reset/save-password',
        handler: saveCustomerPasswordHandler
    },
    {
        name: 'reset customer password',
        method: 'post',
        path: '/password-reset-customer',
        handler: resetCustomerPasswordHandler
    },
    {
        name: 'customer password reset code',
        method: 'post',
        path: '/customer-password-reset-code',
        handler: customerPasswordResetCodeHandler
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
    },
    {
        name: 'get user chats',
        method: 'post',
        path: '/get-user-chats',
        handler: getUserChatsHandler
    },
    {
        name: 'delete chat',
        method: 'delete',
        path: '/delete-chat/:chatId',
        handler: deleteChatsHandler
    },
    {
        name: 'create chat',
        method: 'post',
        path: '/create-chat',
        handler: createChatHandler
    },
    {
        name: 'find chat',
        method: 'get',
        path: '/find-user-chats/:userId',
        handler: findUserChatsHandler
    },
    {
        name: 'find chat',
        method: 'get',
        path: '/find-chat/:firstId/:secondId',
        handler: findChatHandler
    },
    {
        name: 'create chat message',
        method: 'post',
        path: '/create-chat-message',
        handler: createChatMessageHandler
    },
    {
        name: 'get chat messages',
        method: 'get',
        path: '/get-chat-messages/:chatId',
        handler: getChatMessagesHandler
    },
    {
        name: 'fetch users with ids',
        method: 'post',
        path: '/users-with-ids',
        handler: getUsersWithIdsHandler
    },
    {
        name: 'rating customer',
        method: 'put',
        path: '/customer-rating',
        handler: ratingHandler
    }
];

export default customerEndpoints;