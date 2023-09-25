import { Request, Response } from "express";
import PackageController from "../controller/PackageController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const packageController = new PackageController();

export const savePackageHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await packageController.savePackage(req);

    res.status(response.code).json(response);
});

export const deletePackageHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await packageController.deletePackage(req);

    res.status(response.code).json(response);
});

export const fetchPackageHandler = async (req: Request, res: Response) => {
    const response = await packageController.fetchPackages(req);

    res.status(response.code).json(response);
};