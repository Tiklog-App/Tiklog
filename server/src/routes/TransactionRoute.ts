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

export const getRiderTransactionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getRiderTransactions(req);

    res.status(response.code).json(response);
});

export const getTransactionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getTransactions(req);

    res.status(response.code).json(response);
});

export const getAllRiderTransactionsHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getAllRiderTransactions(req);

    res.status(response.code).json(response);
});

export const getTransactionByRefHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getTransactionsByRef(req);

    res.status(response.code).json(response);
});

export const getCustomerWalletHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.getCustomerWallet(req);

    res.status(response.code).json(response);
});

export const getRiderWalletHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.riderWallet(req);

    res.status(response.code).json(response);
});

export const requestPaymentHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.requestPayment(req);

    res.status(response.code).json(response);
});

export const makePaymentHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.makePayment(req);

    res.status(response.code).json(response);
});

export const fetchPaymentRequestHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.fetchPaymentRequest(req);

    res.status(response.code).json(response);
});

export const mobileTransactionAddToWalletHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.mobileTransactionAddTowallet(req);

    res.status(response.code).json(response);
});

export const mobileAddToWalletHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await transactionController.mobileAddToWallet(req);

    res.status(response.code).json(response);
});