import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import { deletePackageHandler, savePackageHandler } from '../../routes/packageRoute';


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
    }
];

export default packageEndpoints;