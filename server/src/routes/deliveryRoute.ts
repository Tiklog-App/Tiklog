import { Request, Response } from "express";
import DeliveryController from "../controller/DeliveryController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";
import { Socket } from "socket.io";

const deliveryController = new DeliveryController();

export const createDeliveryHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.delivery(req);

    res.status(response.code).json(response);
});

export const editDeliveryHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.editDelivery(req);

    res.status(response.code).json(response);
});

export const getSingleDeliveryHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.getSingleDelivery(req);

    res.status(response.code).json(response);
});

export const getDeliveriesHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.getDeliveries(req);

    res.status(response.code).json(response);
});

export const getAllDeliveriesHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.getDeliveriesAll(req);

    res.status(response.code).json(response);
});

export const deleteDeliveryHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.deleteDelivery(req);

    res.status(response.code).json(response);
});

export const findRidersHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await deliveryController.findRiders(req);

    res.status(response.code).json(response);
});

export const packageReqHandler = async (req: Request, res: Response, socket: Socket<any, any, any, any>) =>  {
    await deliveryController.packageRequest(req, socket);
};

export const driverResHandler = async (req: Request, res: Response) =>  {
    const response = await deliveryController.sendDriverResponse(req);

    res.status(response.code).json(response);
};