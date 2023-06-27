import authEndpoints from "./auth.endpoints";
import customerEndpoints from "./customer.endpoints";
import deliveryEndpoints from "./delivery.endpoints";
import packageEndpoints from "./package.endpoints";
import riderEndpoints from "./rider.endpoints";
import roleEndpoints from "./role.endpoints";
import transactionEndpoints from "./transaction.endpoints";
import userEndpoints from "./user.endpoints";
import vehicleEndpoints from "./vehicle.endpoints";

const endpoints = userEndpoints
    .concat(roleEndpoints)
    .concat(authEndpoints)
    .concat(customerEndpoints)
    .concat(packageEndpoints)
    .concat(transactionEndpoints)
    .concat(deliveryEndpoints)
    .concat(riderEndpoints)
    .concat(vehicleEndpoints);

export default endpoints;