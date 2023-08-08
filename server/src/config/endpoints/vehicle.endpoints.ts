import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    deleteVehicleHandler,
    deleteVehicleNameHandler,
    deleteVehicleTypeHandler,
    getSingleVehicleHandler,
    getVehicleNameHandler,
    getVehicleTypeHandler,
    getVehiclesHandler,
    newVehicleHandler,
    newVehicleNameHandler,
    newVehicleTypeHandler,
    updateVehicleHandler,
    updateVehicleNameHandler,
    updateVehicleTypeHandler
} from '../../routes/vehicleRoute';

const vehicleEndpoints: RouteEndpoints = [
    {
        name: 'new vehicle',
        method: 'post',
        path: '/vehicle',
        handler: newVehicleHandler
    },
    {
        name: 'update vehicle',
        method: 'put',
        path: '/vehicle/:vehicleId',
        handler: updateVehicleHandler
    },
    {
        name: 'get single vehicle',
        method: 'get',
        path: '/vehicle/:vehicleId',
        handler: getSingleVehicleHandler
    },
    {
        name: 'get vehicles',
        method: 'get',
        path: '/vehicles',
        handler: getVehiclesHandler
    },
    {
        name: 'delete vehicle',
        method: 'delete',
        path: '/vehicle-delete/:vehicleId',
        handler: deleteVehicleHandler
    },
    {
        name: 'new vehicle name',
        method: 'post',
        path: '/vehicle-name',
        handler: newVehicleNameHandler
    },
    {
        name: 'delete vehicle name',
        method: 'delete',
        path: '/vehicle-name-delete/:vehicleNameId',
        handler: deleteVehicleNameHandler
    },
    {
        name: 'update vehicle name',
        method: 'put',
        path: '/vehicle-name-update/:vehicleNameId',
        handler: updateVehicleNameHandler
    },
    {
        name: 'get vehicle name',
        method: 'get',
        path: '/vehicle-name',
        handler: getVehicleNameHandler
    },
    {
        name: 'new vehicle type',
        method: 'post',
        path: '/vehicle-type',
        handler: newVehicleTypeHandler
    },
    {
        name: 'update vehicle type',
        method: 'put',
        path: '/vehicle-type/:vehicleTypeId',
        handler: updateVehicleTypeHandler
    },
    {
        name: 'delete vehicle type',
        method: 'delete',
        path: '/vehicle-type/:vehicleTypeId',
        handler: deleteVehicleTypeHandler
    },
    {
        name: 'get vehicle type',
        method: 'get',
        path: '/vehicle-type',
        handler: getVehicleTypeHandler
    },
];

export default vehicleEndpoints;