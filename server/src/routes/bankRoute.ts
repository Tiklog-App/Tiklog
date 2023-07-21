import { NextFunction, Request, Response } from "express";
import BankController from "../controller/BankController";

const bankController = new BankController();

export const bankHandler = async (req: Request, res: Response) =>  {
    const response = await bankController.getBanks(req);

    res.status(response.code).json(response);
};