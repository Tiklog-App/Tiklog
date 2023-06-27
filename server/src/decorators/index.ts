import { Request } from 'express';
import { appCommonTypes } from '../@types/app-common';

import 'reflect-metadata';

import CustomAPIError from '../exceptions/CustomAPIError';
import HttpStatus from '../helpers/HttpStatus';

const errorResponse = CustomAPIError.response(
  'Unauthorized access. Please contact system administrator',
  HttpStatus.FORBIDDEN.code,
);

/**
 * @description Specify role name to access resource
 * @description {@param role} must match name of role in the database
 * @name HasRole
 * @param role
 */
export function HasRole(role: string) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (request: Request) {
      //@ts-ignore
      const roles = request.user.roles;

      const findRole = roles.find((item: any) => item.name === role);

      if (!findRole) return errorResponse;
      return method.apply(this, arguments);
    };
  };
}

/**
 *
 * @param authorizedPermission
 * @param userPermissions
 * @returns
 */
export function HasPermission(authorizedPermission: Array<appCommonTypes.Permissions>) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (request: Request) {
      // console.log('re> ', request.permissions);
      let isAuthorized = false;
      if (authorizedPermission.length === 0) isAuthorized = true;
      else
        request.permissions
          .map(item => item.name)
          .forEach(permission_name => {
            if (authorizedPermission.includes(permission_name as appCommonTypes.Permissions)) {
              isAuthorized = true;
            }
          });

      if (!isAuthorized) return Promise.reject(errorResponse);

      return method.apply(this, arguments);
    };
  };
}

/**
 * @name HasAnyRole
 * @description Specify an array of role names to access resource
 * @description Role names must match at least one of the names in the database
 * @description If an asterisk * is supplied as the only element in the array,then all roles will be allowed to access resource.
 * @param roles {string[]}
 */

export function HasAnyRole(roles: string[]) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (request: Request) {
      if (roles[0] === '*') return method.apply(this, arguments);
      //@ts-ignore
      const _roles = request.user.roles;

      if (_roles.length === 0) return errorResponse;

      for (const _role of _roles) {
        const match = roles.some(role => role === _role.name);
        if (!match) return errorResponse;
      }

      return method.apply(this, arguments);
    };
  };
}

/**
 * @description Specify authority name to access resource
 * @name HasAuthority
 * @param authority
 */
export function HasAuthority(authority: string) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (request: Request) {
      const permissions = request.permissions;

      const findRole = permissions.find(item => item.name === authority);

      if (!findRole) return errorResponse;
      return method.apply(this, arguments);
    };
  };
}

/**
 * @name HasAnyAuthority
 * @description Specify an array of role names to access resource
 * @description Authority (Permission) names must match at least one of the names in the database
 * @description If an asterisk * is supplied as the only element in the array,then all authorities will be allowed to access resource.
 * @param authorities {string[]}
 */
export function HasAnyAuthority(authorities: string[]) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (request: Request) {
      if (authorities[0] === '*') return method.apply(this, arguments);

      const _permissions = request.permissions;

      if (_permissions.length === 0) return errorResponse;

      for (const authority of authorities) {
        const match = _permissions.some(permission => permission.name === authority);
        if (!match) return errorResponse;
      }

      return method.apply(this, arguments);
    };
  };
}

export function TryCatch(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (request: Request) {
    try {
      return method.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
