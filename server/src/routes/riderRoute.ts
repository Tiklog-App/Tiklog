import { Request, Response } from "express";
import PasswordEncoder from "../utils/PasswordEncoder";
import RiderController from "../controller/RiderController";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";

const passwordEncoder = new PasswordEncoder();
const riderController = new RiderController(passwordEncoder);

export const updateRiderHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.updateRider(req);

    res.status(response.code).json(response);
});

export const editRiderProfileHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.editRiderProfile(req);

    res.status(response.code).json(response);
});

export const updateRiderStatusHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.updateRiderStatus(req);

    res.status(response.code).json(response);
});

export const deleteRiderHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.deleteRider(req);

    res.status(response.code).json(response);
});

export const changeRiderPasswordHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.changePassword(req);

    res.status(response.code).json(response);
});

export const resetRiderPasswordHandler = async (req: Request, res: Response) =>  {
    const response = await riderController.resetPassword(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const saveRiderPasswordHandler = async (req: Request, res: Response) =>  {
    const response = await riderController.savePassword(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const riderPasswordResetCodeHandler = async (req: Request, res: Response) =>  {
    const response = await riderController.enterPasswordResetCode(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const checkRedisKey = async (req: Request, res: Response) =>  {
    const response = await riderController.checkRedisKey(req);

    //@ts-ignore
    res.status(response.code).json(response);
};

export const saveRiderAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.saveRiderAddress(req);

    res.status(response.code).json(response);
});

export const getRiderAddressesHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.getAddresses(req);

    res.status(response.code).json(response);
});

export const getSingleRiderAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.getSingleAddress(req);

    res.status(response.code).json(response);
});

export const getSingleRiderLicenseHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.getRiderLicense(req);

    res.status(response.code).json(response);
});

export const updateRiderAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.updateAddress(req);

    res.status(response.code).json(response);
});

export const deleteRiderAddressHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.deleteAddress(req);

    res.status(response.code).json(response);
});

export const getRiderHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.rider(req);

    res.status(response.code).json(response);
});

export const getRidersHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.riders(req);

    res.status(response.code).json(response);
});

export const saveRiderLocationHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.saveLocation(req);

    res.status(response.code).json(response);
});

export const updateRiderLocationHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.updateLocation(req);

    res.status(response.code).json(response);
});

export const getRiderLocationHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.getRiderLocation(req);

    res.status(response.code).json(response);
});

export const toggleOnlineOfflineHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.toggleOnlineOffline(req);

    res.status(response.code).json(response);
});

export const changeRiderOnlineHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.changeToOnline(req);

    res.status(response.code).json(response);
});

export const riderLicenseHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.riderLicense(req);

    res.status(response.code).json(response);
});

export const updateRiderLicenseHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.updateRiderLicense(req);

    res.status(response.code).json(response);
});

export const deleteRiderLicenseHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.deleteLicense(req);

    res.status(response.code).json(response);
});

export const isExpiredLicenseHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.isExpiredLicense(req);

    res.status(response.code).json(response);
});

export const fetchRiderLicensesHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.fetchRiderLicenses(req);

    res.status(response.code).json(response);
});

export const updateRiderBankDetailHandler = authenticateRouteWrapper(async (req, res) => {
    const response = await riderController.bankDetails(req);

    res.status(response.code).json(response);
});

export const getRiderRequestsHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.getRequests(req);

    res.status(response.code).json(response);
});

export const getSingleRiderRequestHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.getSingleRequest(req);

    res.status(response.code).json(response);
});

export const ratingHandler = authenticateRouteWrapper( async (req, res) =>  {
    const response = await riderController.rating(req);

    res.status(response.code).json(response);
});