import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IVehicleType {
    vehicleType: string;
    slug: string;
};

const vehicleTypeSchema = new Schema<IVehicleTypeModel>({
    vehicleType: { type: String },
    slug: { type: String }
});

export interface IVehicleTypeModel extends Document, IVehicleType {}

const VehicleType = mongoose.model<IVehicleTypeModel>('VehicleType', vehicleTypeSchema);

export const $saveVehicleTypeSchema: Joi.SchemaMap<IVehicleTypeModel> = {
    vehicleType: Joi.string().required().label('Vehicle type'),
    slug: Joi.string().optional().label('slug')
};

export const $updateVehicleTypeSchema: Joi.SchemaMap<IVehicleTypeModel> = {
    vehicleType: Joi.string().label('Vehicle type'),
    slug: Joi.string().optional().label('slug')
};

export default VehicleType