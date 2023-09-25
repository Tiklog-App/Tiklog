import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import { deletePackageHandler, fetchPackageHandler, savePackageHandler } from '../../routes/packageRoute';


const packageEndpoints: RouteEndpoints = [
    {
        name: 'save package',
        method: 'post',
        path: '/package',
        handler: savePackageHandler
    },
    {
        name: 'delete package',
        method: 'delete',
        path: '/package/:packageId',
        handler: deletePackageHandler
    },
    {
        name: 'fetch packages',
        method: 'get',
        path: '/packages',
        handler: fetchPackageHandler
    }
];

export default packageEndpoints;