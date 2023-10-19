import { Request, Response } from "express";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";
import VehicleController from "../controller/VehicleController";

const vehicleController = new VehicleController();

export const newVehicleHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.newVehicle(req);

    res.status(response.code).json(response);
});

export const updateVehicleHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.updateVehicle(req);

    res.status(response.code).json(response);
});

export const getSingleVehicleHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.getSingleVehicle(req);

    res.status(response.code).json(response);
});

export const getVehiclesHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.getVehicles(req);

    res.status(response.code).json(response);
});

export const deleteVehicleHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.deleteVehicle(req);

    res.status(response.code).json(response);
});

export const newVehicleNameHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.newVehicleName(req);

    res.status(response.code).json(response);
});

export const deleteVehicleNameHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.deleteVehicleName(req);

    res.status(response.code).json(response);
});

export const updateVehicleNameHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.updateVehicleName(req);

    res.status(response.code).json(response);
});

export const getVehicleNameHandler = async (req: Request, res: Response) =>  {
    const response = await vehicleController.getVehicleName(req);

    res.status(response.code).json(response);
};

export const newVehicleTypeHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.newVehicleType(req);

    res.status(response.code).json(response);
});

export const updateVehicleTypeHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.editVehicleType(req);

    res.status(response.code).json(response);
});

export const deleteVehicleTypeHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await vehicleController.deleteVehicleType(req);

    res.status(response.code).json(response);
});

export const getVehicleTypeHandler = async (req: Request, res: Response) =>  {
    const response = await vehicleController.getVehicleType(req);

    res.status(response.code).json(response);
};
