import { Request, Response } from "express";
import PermissionController from "../controller/RoleController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const roleController = new PermissionController();

export const createRoleHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.createRole(req);
    res.status(response.code).json(response);
});

export const deleteRoleHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.deleteRole(req);
    res.status(response.code).json(response);
});

export const updateRoleHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.updateRole(req);

    res.status(response.code).json(response);
});

export const getRolesHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.getAllRoles(req);

    res.status(response.code).json(response);
});

export const getRoleHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.getRole(req);

    res.status(response.code).json(response);
});

export const createPermissionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await roleController.createManyPermissions(req);

    res.status(response.code).json(response);
});