import { Request, Response } from "express";
import FAQController from "../controller/FAQController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const faqController = new FAQController();

export const createFAQHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await faqController.createFAQ(req);

    res.status(response.code).json(response);
});

export const updateFAQHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await faqController.updateFAQ(req);

    res.status(response.code).json(response);
});

export const deleteFAQHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await faqController.deleteFAQ(req);

    res.status(response.code).json(response);
});

export const getSingleFAQHandler = async (req: Request, res: Response) =>  {
    const response = await faqController.getSingleFAQ(req);

    res.status(response.code).json(response);
};

export const fetchFAQHandler = async (req: Request, res: Response) =>  {
    const response = await faqController.fetchFAQ(req);

    res.status(response.code).json(response);
};