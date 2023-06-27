import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    changeRiderOnlineHandler,
    changeRiderPasswordHandler,
    checkRedisKey,
    deleteRiderAddressHandler,
    deleteRiderHandler,
    getRiderAddressesHandler,
    getRiderHandler,
    getRiderLocationHandler,
    getRidersHandler,
    getSingleRiderAddressHandler,
    resetRiderPasswordHandler,
    saveRiderAddressHandler,
    saveRiderLocationHandler,
    saveRiderPasswordHandler,
    toggleOnlineOfflineHandler,
    updateRiderAddressHandler,
    updateRiderHandler,
    updateRiderLocationHandler,
    updateRiderStatusHandler
} from '../../routes/riderRoute';

const riderEndpoints: RouteEndpoints = [
    {
        name: 'update rider',
        method: 'put',
        path: '/rider-update/:riderId',
        handler: updateRiderHandler
    },
    {
        name: 'update rider status',
        method: 'put',
        path: '/rider-status-update/:riderId',
        handler: updateRiderStatusHandler
    },
    {
        name: 'delete rider',
        method: 'delete',
        path: '/delete-rider/:riderId',
        handler: deleteRiderHandler
    },
    {
        name: 'change rider password',
        method: 'put',
        path: '/change-rider-password/:riderId',
        handler: changeRiderPasswordHandler
    },
    {
        name: 'check redis key',
        method: 'get',
        path: '/check-redis-key-rider/:riderId',
        handler: checkRedisKey
    },
    {
        name: 'save rider password',
        method: 'put',
        path: '/password-reset-rider/save-password/:riderId',
        handler: saveRiderPasswordHandler
    },
    {
        name: 'reset rider password',
        method: 'get',
        path: '/password-reset-rider',
        handler: resetRiderPasswordHandler
    },
    {
        name: 'fetch riders',
        method: 'get',
        path: '/riders',
        handler: getRidersHandler
    },
    {
        name: 'get rider',
        method: 'get',
        path: '/rider/:riderId',
        handler: getRiderHandler
    },
    {
        name: 'save rider address',
        method: 'post',
        path: '/rider-address',
        handler: saveRiderAddressHandler
    },
    {
        name: 'get rider addresses',
        method: 'get',
        path: '/rider-addresses',
        handler: getRiderAddressesHandler
    },
    {
        name: 'get rider address',
        method: 'get',
        path: '/rider-address/:id',
        handler: getSingleRiderAddressHandler
    },
    {
        name: 'update rider address',
        method: 'put',
        path: '/rider-address/:id',
        handler: updateRiderAddressHandler
    },
    {
        name: 'delete rider address',
        method: 'delete',
        path: '/rider-address/:id',
        handler: deleteRiderAddressHandler
    },
    {
        name: 'save location',
        method: 'post',
        path: '/rider-location',
        handler: saveRiderLocationHandler
    },
    {
        name: 'update location',
        method: 'put',
        path: '/rider-location-update/:riderId',
        handler: updateRiderLocationHandler
    },
    {
        name: 'get location',
        method: 'get',
        path: '/rider-location',
        handler: getRiderLocationHandler
    },
    {
        name: 'rider online',
        method: 'put',
        path: '/rider-online/:riderId',
        handler: changeRiderOnlineHandler
    },
    {
        name: 'toggle online and offline',
        method: 'put',
        path: '/rider-online-offline/:riderId',
        handler: toggleOnlineOfflineHandler
    },
];

export default riderEndpoints;