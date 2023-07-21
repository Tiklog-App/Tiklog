import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    cancelDeliveryHandler,
    createDeliveryHandler,
    deleteDeliveryHandler,
    driverResHandler,
    editDeliveryHandler,
    findRidersHandler,
    getAllDeliveriesHandler,
    getDeliveriesHandler,
    getSingleDeliveryHandler,
    packageReqHandler
} from '../../routes/deliveryRoute';

const deliveryEndpoints: RouteEndpoints = [
    {
        name: 'create delivery',
        method: 'post',
        path: '/delivery',
        handler: createDeliveryHandler
    },
    {
        name: 'edit delivery',
        method: 'put',
        path: '/delivery/:deliveryId',
        handler: editDeliveryHandler
    },
    {
        name: 'get single delivery',
        method: 'get',
        path: '/delivery/:deliveryId',
        handler: getSingleDeliveryHandler
    },
    {
        name: 'get deliveries',
        method: 'get',
        path: '/customer-deliveries',
        handler: getDeliveriesHandler
    },
    {
        name: 'get all deliveries',
        method: 'get',
        path: '/deliveries',
        handler: getAllDeliveriesHandler
    },
    {
        name: 'delete delivery',
        method: 'delete',
        path: '/delivery/:deliveryId',
        handler: deleteDeliveryHandler
    },
    {
        name: 'cancel delivery',
        method: 'put',
        path: '/cancel-delivery/:deliveryId',
        handler: cancelDeliveryHandler
    },
    {
        name: 'package request',
        method: 'post',
        path: '/delivery/package',
        handler: packageReqHandler
    },
    {
        name: 'driver response',
        method: 'get',
        path: '/driver-response',
        handler: driverResHandler
    },
    {
        name: 'find riders',
        method: 'get',
        path: '/find-riders',
        handler: findRidersHandler
    }
];

export default deliveryEndpoints;