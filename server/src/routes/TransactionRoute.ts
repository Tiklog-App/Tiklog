import { NextFunction, Request, Response } from "express";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";
import TransactionController from "../controller/TransactionController";

const transactionController = new TransactionController();

export const addToWalletHandler = authenticateRouteWrapper(async (req, res) =>  {
    const response = await transactionController.addToWallet(req);

    res.status(response.code).json(response);
});

export const initTransactionCallbackHandler = async (req: Request, res: Response) => {
    const response = await transactionController.initTransactionCallback(req);
  
    res.status(response.code).json(response);
};
  
export const updateTransactionHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.updateTransaction(req);

    res.status(response.code).json(response);
});

export const getCustomerTransactionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getCustomerTransactions(req);

    res.status(response.code).json(response);
});

export const getTransactionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getTransactions(req);

    res.status(response.code).json(response);
});