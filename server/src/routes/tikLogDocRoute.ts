import { Request, Response } from "express";
import TikLogDocsController from "../controller/TikLogDocsController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const tikLogDocsController = new TikLogDocsController();

export const createDocsHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await tikLogDocsController.createDocs(req);

    res.status(response.code).json(response);
});

export const readDocsHandler = async (req: Request, res: Response) =>  {
    const response = await tikLogDocsController.getDocs(req);

    res.status(response.code).json(response);
};

export const updateDocsHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await tikLogDocsController.updateDocs(req);

    res.status(response.code).json(response);
});