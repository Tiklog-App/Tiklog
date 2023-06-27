import { Request, Response } from "express";
import PasswordEncoder from "../utils/PasswordEncoder";
import CustomerController from "../controller/CustomerController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const passwordEncoder = new PasswordEncoder();
const customerController = new CustomerController(passwordEncoder);

export const updateCustomerHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.updateCustomer(req);

    res.status(response.code).json(response);
});

export const updateCustomerStatusHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.updateCustomerStatus(req);

    res.status(response.code).json(response);
});

export const deleteCustomerHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.deleteCustomer(req);

    res.status(response.code).json(response);
});

export const getCustomerHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.customer(req);

    res.status(response.code).json(response);
});

export const getCustomersHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.customers(req);

    res.status(response.code).json(response);
});

export const changeCustomerPasswordHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await customerController.changePassword(req);

    res.status(response.code).json(response);
});

export const resetCustomerPasswordHandler = async (req: Request, res: Response) =>  {
    const response = await customerController.resetPassword(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const saveCustomerPasswordHandler = async (req: Request, res: Response) =>  {
    const response = await customerController.savePassword(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const checkRedisKey = async (req: Request, res: Response) =>  {
    const response = await customerController.checkRedisKey(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const saveCustomerAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await customerController.saveCustomerAddress(req);

    res.status(response.code).json(response);
});

export const getCustomerAddressesHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await customerController.getAddresses(req);

    res.status(response.code).json(response);
});

export const getSingleCustomerAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await customerController.getSingleAddress(req);

    res.status(response.code).json(response);
});

export const updateCustomerAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await customerController.updateAddress(req);

    res.status(response.code).json(response);
});

export const deleteCustomerAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await customerController.deleteAddress(req);

    res.status(response.code).json(response);
});