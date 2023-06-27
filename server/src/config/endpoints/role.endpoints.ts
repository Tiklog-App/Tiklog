import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import { createRoleHandler, deleteRoleHandler, getRoleHandler, getRolesHandler, updateRoleHandler } from '../../routes/roleRoute';

const roleEndpoints: RouteEndpoints = [
    {
        name: 'create role',
        method: 'post',
        path: '/role',
        handler: createRoleHandler
    },
    {
        name: 'delete role',
        method: 'delete',
        path: '/role-delete/:roleId',
        handler: deleteRoleHandler
    },
    {
        name: 'update role',
        method: 'put',
        path: '/role-update/:roleId',
        handler: updateRoleHandler
    },
    {
        name: 'get roles',
        method: 'get',
        path: '/roles',
        handler: getRolesHandler
    },
    {
        name: 'get role',
        method: 'get',
        path: '/role/:roleId',
        handler: getRoleHandler
    }
];

export default roleEndpoints;