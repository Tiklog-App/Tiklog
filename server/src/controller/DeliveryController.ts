import { Request } from 'express';
import { HasPermission, TryCatch } from "../decorators";
import HttpStatus from "../helpers/HttpStatus";
import CustomAPIError from "../exceptions/CustomAPIError";
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';
import { $deliverySchema, $editDeliverySchema, IDeliveryModel } from '../models/Delivery';
import Generic from '../utils/Generic';
import {
    PENDING,
    MAX_DISTANCE,
    DELIVERED,
    ON_TRANSIT,
    CANCELED,
    PACKAGE_REQUEST_INFO,
    PAID
} from '../config/constants';
import HttpResponse = appCommonTypes.HttpResponse;
import { CUSTOMER_PERMISSION, DELETE_DELIVERY, MANAGE_ALL, MANAGE_SOME, READ_DELIVERY } from '../config/settings';
import RabbitMqService from '../services/RabbitMqService';
import RiderLocation from '../models/RiderLocation';
import { Socket } from 'socket.io';
import RedisService from '../services/RedisService';
import { appModelTypes } from '../@types/app-model';
import IPackageRequestData = appModelTypes.IPackageRequestData;

const redisService = new RedisService();
const rabbitMqService = new RabbitMqService();

export default class DeliveryController {


    /***
     * @name delivery
     * @req This requests for the user id 
     * @desc The api calculates speed and fee based on
     * @desc the vehicle selected. then it calculates the 
     * @desc distance between the sender and recipient.
     * @desc it uses the distance gotten to calculate
     * @desc the delivery fee per kilometer
     * 
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async delivery (req: Request) {
        const delivery = await this.doDelivery(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Delivery created successfully',
            result: delivery
        };
      
        return Promise.resolve(response);
    
    };
    
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async payForDelivery (req: Request) {
        const delivery = await this.doPayForDelivery(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Payment was successful',
            result: delivery
        };
      
        return Promise.resolve(response);
    
    };

    /****
     * @name editDelivery
     * @req delivery id as params
     * @desc deliveries can be edited only when 
     * @desc its pending. When location is edited
     * @desc it recalculates the delivery fee and
     * @desc either substract or add to the wallet
     * 
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async editDelivery (req: Request) {
        const delivery = await this.doEditDelivery(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Delivery updated successfully',
            result: delivery
        };
      
        return Promise.resolve(response);
    
    };

    /**
     * 
     * @param req delivery id 
     * @desc gets a single delivery
     * @returns an object of the edited delivery
     * 
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, MANAGE_ALL, MANAGE_SOME, READ_DELIVERY])
    public async getSingleDelivery(req: Request) {

        const deliveryId = req.params.deliveryId

        const delivery = await datasources.deliveryDAOService.findById(deliveryId);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: delivery,
        };
      
        return Promise.resolve(response);
    };

    /**
     * 
     * @param req user id 
     * @returns deliveries initiated by a customer
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, READ_DELIVERY, MANAGE_ALL, MANAGE_SOME])
    public async getDeliveries(req: Request) {

        //@ts-ignore
        const customerId = req.user._id

        const deliveries = await datasources.deliveryDAOService.findAll({
            customer: customerId
        });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: deliveries,
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([READ_DELIVERY, MANAGE_ALL, MANAGE_SOME])
    public async getAllDeliveries(req: Request) {

        //@ts-ignore
        const customerId = req.params.customerId;

        const deliveries = await datasources.deliveryDAOService.findAll({
            customer: customerId
        });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: deliveries,
        };
      
        return Promise.resolve(response);
    };

    /**
     * 
     * @returns all the deliveries in the database
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_DELIVERY])
    public async getDeliveriesAll(req: Request) {

        const deliveries = await datasources.deliveryDAOService.findAll({});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: deliveries,
        };
      
        return Promise.resolve(response);
    };

    /**
     * 
     * @param req deliveryID
     * @desc deletes a single delivery 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, CUSTOMER_PERMISSION, DELETE_DELIVERY])
    public async deleteDelivery(req: Request) {

        const deliveryId = req.params.deliveryId

        const delivery = await datasources.deliveryDAOService.findById(deliveryId);
        if(!delivery)
            return Promise.reject(CustomAPIError.response('Delivery not found', HttpStatus.NOT_FOUND.code));

        if(delivery.status === PENDING)
            return Promise.reject(CustomAPIError.response('Delivery is pending, can not delete delivery at this time', HttpStatus.BAD_REQUEST.code));

        if(delivery.status === ON_TRANSIT)
            return Promise.reject(CustomAPIError.response('Delivery is on transit, can not delete delivery at this time', HttpStatus.BAD_REQUEST.code));


        await datasources.deliveryDAOService.deleteById(deliveryId);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Delivery deleted successfully'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, CUSTOMER_PERMISSION])
    public async cancelDelivery(req: Request) {

        const deliveryId = req.params.deliveryId

        const delivery = await datasources.deliveryDAOService.findById(deliveryId);
        if(!delivery)
            return Promise.reject(CustomAPIError.response('Delivery not found.', HttpStatus.NOT_FOUND.code));

        if(delivery.status === ON_TRANSIT)
            return Promise.reject(CustomAPIError.response('Package already in transit, can not cancel delivery at this time.', HttpStatus.BAD_REQUEST.code));

        if(delivery.status === DELIVERED)
            return Promise.reject(CustomAPIError.response('Package has already been delivered, can not cancel delivery at this time.', HttpStatus.BAD_REQUEST.code));

        if(delivery.status === CANCELED)
            return Promise.reject(CustomAPIError.response('Can not cancel delivery at this time, already canceled.', HttpStatus.BAD_REQUEST.code));

        if(delivery.status === PAID)
            return Promise.reject(CustomAPIError.response('Cannot cancel delivery at this time; it has already been paid for.', HttpStatus.BAD_REQUEST.code));

        const wallet = await datasources.walletDAOService.findByAny({customer: delivery.customer});
        if(!wallet)
            return Promise.reject(CustomAPIError.response('Wallet not found', HttpStatus.NOT_FOUND.code));

        await datasources.deliveryDAOService.updateByAny(
            { _id: deliveryId },
            { status: CANCELED }
        );

        await datasources.walletDAOService.updateByAny(
            { customer: delivery.customer },
            { balance: wallet.balance + delivery.deliveryFee }
        )

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Delivery canceled successfully'
        };
      
        return Promise.resolve(response);
    };

    /***
     * @name findRiders
     * @desc finds riders that are located 1000km
     * @desc around a customer
     * @returns the rider data closest to the customer
     * @returns the rider time of arrival
     */
    @TryCatch
    public async findRiders(req: Request) {

        //@ts-ignore
        const customerId = req.user._id

        const { error, value } = Joi.object<any>({
            deliveryRef: Joi.string().required().label("Delivery reference")
        }).validate(req.body);
        if(error) return Promise.reject(
            CustomAPIError.response(
                error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const deliveries = await datasources.deliveryDAOService.findAll(
            {customer: customerId}
        );
        if(!deliveries)
            return Promise.reject(CustomAPIError.response('No delivery found', HttpStatus.NOT_FOUND.code));
        
        const delivery = deliveries.find(delivery => delivery.deliveryRefNumber === value.deliveryRef);
        if(!delivery)
            return Promise.reject(
                CustomAPIError
                .response('The reference provided does not match any delivery.', 
                HttpStatus.NOT_FOUND.code));

        if(delivery.status === CANCELED || delivery.status === DELIVERED)
            return Promise.reject(CustomAPIError.response('No pending delivery, please fill out a new delivery', HttpStatus.NOT_FOUND.code));

        const customerLongitude = delivery.senderLocation.coordinates[0];
        const customerLatitude = delivery.senderLocation.coordinates[1];
        const deliveryRefNumber = delivery.deliveryRefNumber;
        const estimatedDeliveryTime = delivery.estimatedDeliveryTime;

        const riderLocations = await RiderLocation.aggregate([
            {
              $geoNear: {
                near: {
                  type: 'Point',
                  coordinates: [customerLongitude, customerLatitude],
                },
                distanceField: 'distance',
                maxDistance: MAX_DISTANCE,
                spherical: true,
              },
            },
            {
                $sort: { distance: 1 }
            }
        ]).exec();

        if(!riderLocations.length)
            return Promise.reject(CustomAPIError.response('No rider is available at the moment', HttpStatus.NOT_FOUND.code));

        const riderIds = riderLocations.map((riderLocation) => riderLocation.rider);
        const riders = await datasources.riderDAOService.findAll({ _id: { $in: riderIds } });

        /*** Logic to find rider that meets these criteria
         * 1. online
         * 2. active
         * 3. rider license is not expired
         * 4. rider vehicle type is same as delivery vehicle type
         */
        let rider: any = null;
        for (const riderLoc of riders) {
            
            const _rider = await datasources.riderDAOService.findById(riderLoc._id);
            const _rider_license = await datasources.riderLicenseDAOService.findByAny({ rider: riderLoc._id });

            const isValidRider =
              _rider?.status === 'online' &&
              _rider?.active &&
              !_rider_license?.isExpired;

            if (isValidRider) {
              const riderVehicle = await datasources.vehicleDAOService.findByAny({rider: _rider._id});

              if (riderVehicle && riderVehicle.vehicleType === delivery.vehicle) {
                rider = _rider;
                break;
              }
            }
        }
        /** Logic End */

        if(rider === null)
            return Promise.reject(CustomAPIError.response('No rider is currently online', HttpStatus.NOT_FOUND.code));

        const vehicle = await datasources.vehicleDAOService.findByAny({
            rider: rider?._id
        });

        const bike = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'bike'});
        const car = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'car'});
        const van = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'van'});
        const truck = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'truck'});

        if(!bike || !car || !van || !truck)
            return Promise.reject(CustomAPIError.response('Vehicle type not found', HttpStatus.NOT_FOUND.code))

        let speedInKmPerHour = 0;
        if(vehicle){
            //checks speed and fee based on vehicle selected
            if(vehicle?.vehicleType === 'bike') {
                speedInKmPerHour += bike.speed
            } else if(vehicle?.vehicleType === 'car') {
                speedInKmPerHour += car.speed
            } else if(vehicle?.vehicleType === 'van') {
                speedInKmPerHour += van.speed
            } else {
                speedInKmPerHour += truck.speed
            };
        }

        const riderLoc = riderLocations.find((data) => data.rider.equals(rider.id));
        const estimatedTimeToSender = () => {
            const distanceKm = riderLoc.distance / 1000;
            return distanceKm / speedInKmPerHour
        }

        const hours = Math.floor(estimatedTimeToSender());
        const minutes = Math.round((estimatedTimeToSender() - hours) * 60);

        const pinRiderLoc = await datasources.riderLocationDAOService.findByAny({
            rider: rider._id
        });

        const riderData = {
            location: {
                longitude: pinRiderLoc?.location.coordinates[0],
                latitude: pinRiderLoc?.location.coordinates[1]
            },
            phone: rider.phone,
            email: rider.email,
            _id: rider._id,
            status: rider.status,
            firstName: rider.firstName,
            lastName: rider.lastName,
            gender: rider.gender,
            profileImage: rider.profileImageUrl,
            plateNumber: vehicle?.licencePlateNumber,
            vehicleDetails: `${vehicle?.vehicleColor} ${vehicle?.vehicleModel} ${vehicle?.vehicleName} ${vehicle?.vehicleModel}`
        };

        let arrivalTime = 0
        if(minutes <= 2) {
            arrivalTime += 2
        } else {
            arrivalTime += minutes
        };

        const senderDetials = await datasources.customerDAOService.findById(delivery.customer);

        const packageRequestData: IPackageRequestData = {
            customerId: customerId,
            recipientAddress: delivery.recipientAddress,
            senderAddress: delivery.senderAddress,
            riderId: rider._id,
            riderFirstName: rider.firstName,
            senderName: delivery.senderName,
            arrivalTime: `Rider will arrive in ${arrivalTime}min`,
            deliveryRefNumber: deliveryRefNumber,
            estimatedDeliveryTime: estimatedDeliveryTime,
            deliveryId: delivery._id,
            senderPhoto: senderDetials?.profileImageUrl,
            riderPhoto: rider.profileImageUrl
        }

        const redisData = JSON.stringify(packageRequestData)
        redisService.saveToken(PACKAGE_REQUEST_INFO, redisData)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: `Rider is ${arrivalTime}min away from your location`,
            result: riderData
        };
      
        return Promise.resolve(response);
        
    }

    @TryCatch
    public async packageRequest(req: Request, socket: Socket<any, any, any, any>) {
        await rabbitMqService.connectToRabbitMQ()

        const rider = await redisService.getToken(PACKAGE_REQUEST_INFO);

        let packageRequest: any = null
        if(rider) {
            packageRequest = rider
        }

        await rabbitMqService.submitPackageRequest(packageRequest, socket)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: `Requested`
        };
      
        return Promise.resolve(response);
    }

    @TryCatch
    public async sendDriverResponse(req: Request) {
        await rabbitMqService.connectToRabbitMQ();

        const { error, value } = Joi.object<any>({
            availability: Joi.boolean().required().label("Delivery availability")
        }).validate(req.body);
        if(error) return Promise.reject(
            CustomAPIError.response(
                error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const customerDetail: any = await redisService.getToken(PACKAGE_REQUEST_INFO);

        if(!customerDetail)
            return Promise.reject(CustomAPIError.response('Response was sent to the customer already', HttpStatus.BAD_REQUEST.code));

        const riderResponse = {
            customerId: customerDetail.customerId,
            riderId: customerDetail.riderId,
            availability: value.availability,
            arrivalTime: customerDetail.arrivalTime,
            riderPhoto: customerDetail.riderPhoto,
            riderName: customerDetail.riderFirstName
        };

        await rabbitMqService.sendDriverResponse(riderResponse);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: `Rider response`
        };
      
        return Promise.resolve(response);
    }

    @TryCatch
    public async getActiveCustomerDeliveries(req: Request) {
        //@ts-ignore
        const customerId = req.user._id;
    
        const deliveries = await datasources.deliveryDAOService.findAll({
            $and: [
                { customer: customerId },
                { status: { $nin: [DELIVERED, PENDING, CANCELED, PAID] } }
            ]
        });
    
        const result = await Promise.all(deliveries.map(async (delivery) => {
            const vehicle = await datasources.vehicleDAOService.findByAny({ rider: delivery.rider });
    
            return {
                ...delivery.toObject(),
                plateNumber: vehicle?.licencePlateNumber || '',
                vehicleDetails: vehicle
                    ? `${vehicle.vehicleColor} ${vehicle.vehicleModel} ${vehicle.vehicleName} ${vehicle.vehicleModel}`
                    : ''
            };
        }));
    
        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Deliveries',
            results: result
        };
    
        return Promise.resolve(response);
    }
    

    @TryCatch
    public async getActiveRiderDeliveries(req: Request) {
        //@ts-ignore
        const riderId = req.user._id;

        const deliveries = await datasources.deliveryDAOService.findAll({
            $and: [
                { rider: riderId },
                { status: { $nin: [DELIVERED, PENDING, CANCELED, PAID] } }
            ]
        });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: `Deliveries`,
            results: deliveries
        };
      
        return Promise.resolve(response);
    }

    private async doDelivery (req: Request) {

        //@ts-ignore
        const customerId = req.user._id

        const { error, value } = Joi.object<any>($deliverySchema).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const customer = await datasources.customerDAOService.findById(customerId);
        if(customer && customer.level < 3) {
            return Promise.reject(
                CustomAPIError.response('Please complete your personal information and provide your address details before initiating a delivery.', 
                HttpStatus.NOT_FOUND.code));
        }

        const bike = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'bike'});
        const car = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'car'});
        const van = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'van'});
        const truck = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'truck'});

        if(!bike || !car || !van || !truck)
            return Promise.reject(CustomAPIError.response('Vehicle type not found', HttpStatus.NOT_FOUND.code))
        
        //checks speed and fee based on vehicle selected
        let speed = 0;
        let fee = 0;
        if(value.vehicle === 'bike') {
            speed += bike.speed
            fee += bike.costPerKm
        } else if(value.vehicle === 'car') {
            speed += car.speed
            fee += car.costPerKm
        } else if(value.vehicle === 'van') {
            speed += van.speed
            fee += van.costPerKm
        } else {
            speed += truck.speed
            fee += truck.costPerKm
        };

        const distance = Generic
            .location_difference(
                value.senderLat,
                value.senderLon,
                value.recipientLat,
                value.recipientLon,
                speed //estimated speed of the rider
            );

        const _deliveryFee = +distance.distance.toFixed(2) * fee;

        const wallet = await datasources.walletDAOService.findByAny({
            customer: customerId
        });
        if(!wallet)
            return Promise.reject(CustomAPIError.response('Wallet not found', HttpStatus.NOT_FOUND.code));
        
        // if(wallet.balance < _deliveryFee)
        //     return Promise.reject(CustomAPIError.response('Wallet is low on cash, please fund wallet.', HttpStatus.BAD_REQUEST.code));

        const deliveryValue: Partial<IDeliveryModel> = {
            ...value,
            senderLocation: {
                type: 'Point',
                coordinates: [value.senderLon, value.senderLat]
            },
            recipientLocation: {
                type: 'Point',
                coordinates: [value.recipientLon, value.recipientLat],
            },
            status: PENDING,
            deliveryFee: Math.round(_deliveryFee + 0.5),
            customer: customerId,
            estimatedDeliveryTime: `${distance.hours}:${distance.minutes}`,
            deliveryRefNumber: Generic.generateSlug(Generic.generateDeliveryRefNumber(6))
        };

        const delivery  = await datasources.deliveryDAOService.create(deliveryValue as IDeliveryModel);

        // if(delivery) {
        //     const amount = wallet && wallet.balance - delivery.deliveryFee;

        //     const walletBalance = {
        //         balance: amount
        //     };

        //     await datasources.walletDAOService.update(
        //         { _id: wallet._id },
        //         walletBalance
        //     )
        // };

        return delivery;
    }

    private async doPayForDelivery (req: Request) {

        //@ts-ignore
        const customerId = req.user._id;

        const { error, value } = Joi.object<any>({
            deliveryRefNumber: Joi.string().required().label('delivery reference number')
        }).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const wallet = await datasources.walletDAOService.findByAny({
            customer: customerId
        });

        if(!wallet)
            return Promise.reject(CustomAPIError.response('No wallet found', HttpStatus.NOT_FOUND.code));

        const delivery = await datasources.deliveryDAOService.findByAny({
            deliveryRefNumber: value.deliveryRefNumber
        })

        if(!delivery)
            return Promise.reject(CustomAPIError.response('Delivery not found.', HttpStatus.NOT_FOUND.code));
        
        if(delivery.status === PAID)
            return Promise.reject(CustomAPIError.response('Delivery already paid for.', HttpStatus.NOT_FOUND.code));

        if(delivery.status === DELIVERED)
            return Promise.reject(CustomAPIError.response('Delivery has already been delivered.', HttpStatus.NOT_FOUND.code));

        if(delivery.status === CANCELED)
            return Promise.reject(CustomAPIError.response('Delivery has already been canceled.', HttpStatus.NOT_FOUND.code));

        if(delivery.status === ON_TRANSIT)
            return Promise.reject(CustomAPIError.response('Delivery is on transit.', HttpStatus.NOT_FOUND.code));

        if(wallet.balance < delivery.deliveryFee)
            return Promise.reject(
                CustomAPIError.response(
                    'Wallet is low on cash, please fund wallet.', HttpStatus.BAD_REQUEST.code)
                );

        const amount = wallet.balance - delivery.deliveryFee;

        const walletBalance = {
            balance: amount
        };

        await datasources.deliveryDAOService.update(
            {_id: delivery._id},
            { status: PAID }
        );

        const response = await datasources.walletDAOService.updateByAny(
            { _id: wallet._id },
            walletBalance
        );

        return response;
    }

    private async doEditDelivery (req: Request) {

        //@ts-ignore
        const deliveryId = req.params.deliveryId;

        const { error, value } = Joi.object<any>($editDeliverySchema).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
        const _delivery = await datasources.deliveryDAOService.findById(deliveryId);
        if(!_delivery)
            return Promise.reject(CustomAPIError.response('Delivery does not exist', HttpStatus.NOT_FOUND.code));
            
        if(_delivery.status !== PENDING)
            return Promise.reject(CustomAPIError.response('Delivery can not be edited', HttpStatus.BAD_REQUEST.code));

        const bike = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'bike'});
        const car = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'car'});
        const van = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'van'});
        const truck = await datasources.vehicleTypeDAOService.findByAny({vehicleType: 'truck'});

        if(!bike || !car || !van || !truck)
            return Promise.reject(CustomAPIError.response('Vehicle type not found', HttpStatus.NOT_FOUND.code))
        
        //checks speed and fee based on vehicle selected
        let speed = 0;
        let fee = 0;
        if(value.vehicle === 'bike') {
            speed += bike.speed
            fee += bike.costPerKm
        } else if(value.vehicle === 'car') {
            speed += car.speed
            fee += car.costPerKm
        } else if(value.vehicle === 'van') {
            speed += van.speed
            fee += van.costPerKm
        } else {
            speed += truck.speed
            fee += truck.costPerKm
        };

        const distance = Generic
            .location_difference(
                value.senderLat,
                value.senderLon,
                value.recipientLat,
                value.recipientLon,
                speed //estimated speed of the rider
            );

        const _deliveryFee = +distance.distance.toFixed(2) * fee;

        const wallet = await datasources.walletDAOService.findByAny({
            customer: _delivery.customer
        });

        if(!wallet)
            return Promise.reject(CustomAPIError.response('Wallet not found', HttpStatus.NOT_FOUND.code));
        
        let deliveryDiff: number = 0;
        if(_delivery.deliveryFee > _deliveryFee) {
            deliveryDiff += _delivery.deliveryFee - _deliveryFee
        } else {
            deliveryDiff += _delivery.deliveryFee - _deliveryFee
        }

        const isNegative = !isNaN(deliveryDiff) && deliveryDiff < 0; //check if deliveryDiff is a negative number

        if(isNegative && Math.abs(deliveryDiff) > wallet.balance)
            return Promise.reject(CustomAPIError.response('Wallet is low on cash, please fund wallet', HttpStatus.BAD_REQUEST.code));

        const deliveryValue: Partial<IDeliveryModel> = {
            ...value,
            senderLocation: {
                type: 'Point',
                coordinates: [value.senderLon, value.senderLat]
            },
            recipientLocation: {
                type: 'Point',
                coordinates: [value.recipientLon, value.recipientLat],
            },
            status: PENDING,
            deliveryFee: _deliveryFee.toFixed(2),
            customer: _delivery.customer,
            estimatedDeliveryTime: distance.time
        };

        const delivery  = await datasources.deliveryDAOService.updateByAny(
            { _id: _delivery._id },
            deliveryValue
        );

        // if(delivery) {
        //     const amount = wallet && wallet.balance + deliveryDiff;

        //     const walletBalance = {
        //         balance: amount?.toFixed(2)
        //     };

        //     await datasources.walletDAOService.update(
        //         { _id: wallet?._id },
        //         walletBalance
        //     )
        // };

        return delivery;
    }

}