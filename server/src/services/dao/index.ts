import UserRepository from "../../repositories/UserRepository";
import PermissionRepository from "../../repositories/PermissionRepository";
import RoleRepository from "../../repositories/RoleRepository";
import CustomerRepository from "../../repositories/CustomerRepository";
import RiderRepository from "../../repositories/RiderRepository";
import RiderLocationRepository from "../../repositories/RiderLocationRepository";
import PackageRepository from "../../repositories/PackageRepository";
import CustomerAddressRepository from "../../repositories/CustomerAddressRepository";
import WalletRepository from "../../repositories/WalletRepository";
import TransactionRepository from "../../repositories/TransactionRepository";
import DeliveryRepository from "../../repositories/DeliveryRepository";
import RiderAddressRepository from "../../repositories/RiderAddressRepository";
import VehicleRepository from "../../repositories/VehicleRepository";
import VehicleTypeRepository from "../../repositories/VehicleTypeRepository";
import VehicleNameRepository from "../../repositories/VehicleNameRepository";
import NotificationRepository from "../../repositories/NotificationRepository";
import RiderLicenseRepository from "../../repositories/RiderLicenseRepository";

import PermissionDAOService from "./PermissionDAOService";
import RoleDAOService from "./RoleDAOService";
import UserDAOService from "./UserDAOService";
import CustomerDAOService from "./CustomerDAOService";
import RiderDAOService from "./RiderDAOService";
import RiderLocationDAOService from "./RiderLocationDAOService";
import PackageDAOService from "./PackageDAOService";
import CustomerAddressDAOService from "./CustomerAddressDAOService";
import WalletDAOService from "./WalletDAOService";
import TransactionDAOService from "./TransactionDAOService";
import DeliveryDAOService from "./DeliveryDAOService";
import RiderAddressDAOService from "./RiderAddressDAOService";
import VehicleDAOService from "./VehicleDAOService";
import VehicleNameDAOService from "./VehicleNameDAOService";
import VehicleTypeDAOService from "./VehicleTypeDAOService";
import NotificationDAOService from "./NotificationDAOService";
import RiderLicenseDAOService from "./RiderLicenseDAOService";

const permissionRepository = new PermissionRepository();
const roleRepository = new RoleRepository();
const userRepository = new UserRepository();
const customerRepository = new CustomerRepository();
const riderRepository = new RiderRepository();
const riderLocationRepository = new RiderLocationRepository();
const packageRepository = new PackageRepository();
const customerAddressRepository = new CustomerAddressRepository();
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const deliveryRepository = new DeliveryRepository();
const riderAddressRepository = new RiderAddressRepository();
const vehicleRepository = new VehicleRepository();
const vehicleTypeRepository = new VehicleTypeRepository();
const vehicleNameRepository = new VehicleNameRepository();
const notificationRepository = new NotificationRepository();
const riderLicenseRepository = new RiderLicenseRepository();

const permissionDAOService = new PermissionDAOService(permissionRepository);
const roleDAOService = new RoleDAOService(roleRepository);
const userDAOService = new UserDAOService(userRepository);
const customerDAOService = new CustomerDAOService(customerRepository);
const riderDAOService = new RiderDAOService(riderRepository);
const riderLocationDAOService = new RiderLocationDAOService(riderLocationRepository);
const packageDAOService = new PackageDAOService(packageRepository);
const customerAddressDAOService = new CustomerAddressDAOService(customerAddressRepository);
const walletDAOService = new WalletDAOService(walletRepository);
const transactionDAOService = new TransactionDAOService(transactionRepository);
const deliveryDAOService = new DeliveryDAOService(deliveryRepository);
const riderAddressDAOService = new RiderAddressDAOService(riderAddressRepository);
const vehicleDAOService = new VehicleDAOService(vehicleRepository);
const vehicleNameDAOService = new VehicleNameDAOService(vehicleNameRepository);
const vehicleTypeDAOService = new VehicleTypeDAOService(vehicleTypeRepository);
const notificationDAOService = new NotificationDAOService(notificationRepository);
const riderLicenseDAOService = new RiderLicenseDAOService(riderLicenseRepository);

export default {
    vehicleDAOService,
    vehicleNameDAOService,
    vehicleTypeDAOService,
    permissionDAOService,
    roleDAOService,
    userDAOService,
    customerDAOService,
    riderLocationDAOService,
    riderDAOService,
    packageDAOService,
    customerAddressDAOService,
    walletDAOService,
    transactionDAOService,
    deliveryDAOService,
    riderAddressDAOService,
    notificationDAOService,
    riderLicenseDAOService
}