import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoints = appCommonTypes.RouteEndpoints;
import {
    changeUserPasswordHandler,
    createUser,
    deleteUserHandler,
    getUserHandler,
    getUsersHandler,
    resetUserPasswordHandler,
    saveUserPasswordHandler,
    updateUserHandler,
    updateUserStatusHandler,
    userPasswordResetCodeHandler
} from '../../routes/userRoute';

const userEndpoints: RouteEndpoints = [
    {
        name: 'user',
        method: 'post',
        path: '/user',
        handler: createUser
    },
    {
        name: 'update user',
        method: 'put',
        path: '/user-update',
        handler: updateUserHandler
    },
    {
        name: 'update user status',
        method: 'put',
        path: '/user-status-update/:userId',
        handler: updateUserStatusHandler
    },
    {
        name: 'delete user',
        method: 'delete',
        path: '/delete-user/:userId',
        handler: deleteUserHandler
    },
    {
        name: 'change user password',
        method: 'put',
        path: '/change-user-password/:userId',
        handler: changeUserPasswordHandler
    },
    {
        name: 'fetch users',
        method: 'get',
        path: '/users',
        handler: getUsersHandler
    },
    {
        name: 'get user',
        method: 'get',
        path: '/user/:userId',
        handler: getUserHandler
    },
    {
        name: 'save user password',
        method: 'put',
        path: '/password-reset/save-user-password',
        handler: saveUserPasswordHandler
    },
    {
        name: 'reset user password',
        method: 'post',
        path: '/password-reset-user',
        handler: resetUserPasswordHandler
    },
    {
        name: 'user password reset code',
        method: 'post',
        path: '/user-password-reset-code',
        handler: userPasswordResetCodeHandler
    },
];

export default userEndpoints;