import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoint = appCommonTypes.RouteEndpoints;
import { bankHandler } from '../../routes/bankRoute';

const bankEndpoints: RouteEndpoint  = [
    {
        name: 'get banks',
        method: 'get',
        path: '/get-banks',
        handler: bankHandler
    }
]

export default bankEndpoints;