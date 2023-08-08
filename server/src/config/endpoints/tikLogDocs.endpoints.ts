import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoint = appCommonTypes.RouteEndpoints;
import { createDocsHandler, readDocsHandler, updateDocsHandler } from '../../routes/tikLogDocRoute';

const tikLogDocEndpoints: RouteEndpoint  = [
    {
        name: 'create doc',
        method: 'post',
        path: '/tiklog-doc',
        handler: createDocsHandler
    },
    {
        name: 'read doc',
        method: 'get',
        path: '/tiklog-doc',
        handler: readDocsHandler
    },
    {
        name: 'update doc',
        method: 'put',
        path: '/tiklog-doc/:docId',
        handler: updateDocsHandler
    }
]

export default tikLogDocEndpoints;