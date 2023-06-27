import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IVehicleName {
    vehicleName: string;
    slug: string;
    vehicleModel: string[];
};

const vehicleNameSchema = new Schema<IVehicleNameModel>({
    vehicleName: { type: String },
    slug: { type: String },
    vehicleModel: [{ type: String }]
});

export interface IVehicleNameModel extends Document, IVehicleName {}

const VehicleName = mongoose.model<IVehicleNameModel>('VehicleName', vehicleNameSchema);

export const $saveVehicleNameSchema: Joi.SchemaMap<IVehicleNameModel> = {
    vehicleName: Joi.string().required().label('Vehicle name'),
    slug: Joi.string().optional().label('slug'),
    vehicleModel: Joi.array().required().label('permit')
};

export const $updateVehicleNameSchema: Joi.SchemaMap<IVehicleNameModel> = {
    vehicleName: Joi.string().label('Vehicle name'),
    slug: Joi.string().optional().label('slug'),
    vehicleModel: Joi.array().label('permit')
};

export default VehicleName