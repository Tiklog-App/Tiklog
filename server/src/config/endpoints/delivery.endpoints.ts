import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    cancelDeliveryHandler,
    createDeliveryHandler,
    customerActiveDeliveriesHandler,
    deleteDeliveryHandler,
    driverResHandler,
    editDeliveryHandler,
    findRidersHandler,
    getAllCustomerDeliveriesHandler,
    getAllDeliveriesHandler,
    getDeliveriesHandler,
    getSingleDeliveryHandler,
    packageReqHandler,
    payForDeliveryHandler,
    riderActiveDeliveriesHandler
} from '../../routes/deliveryRoute';

const deliveryEndpoints: RouteEndpoints = [
    {
        name: 'create delivery',
        method: 'post',
        path: '/delivery',
        handler: createDeliveryHandler
    },
    {
        name: 'pay for delivery',
        method: 'post',
        path: '/make/delivery/payment',
        handler: payForDeliveryHandler
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
        name: 'get all customer deliveries',
        method: 'get',
        path: '/customer/deliveries/:customerId',
        handler: getAllCustomerDeliveriesHandler
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
        method: 'post',
        path: '/driver-response',
        handler: driverResHandler
    },
    {
        name: 'find riders',
        method: 'post',
        path: '/find-riders',
        handler: findRidersHandler
    },
    {
        name: 'get active customer deliveries',
        method: 'get',
        path: '/find-active-customer-deliveries',
        handler: customerActiveDeliveriesHandler
    },
    {
        name: 'get active rider deliveries',
        method: 'get',
        path: '/find-active-rider-deliveries',
        handler: riderActiveDeliveriesHandler
    }
];

export default deliveryEndpoints;