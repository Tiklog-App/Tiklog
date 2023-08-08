import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IVehicleType {
    vehicleType: string;
    slug: string;
    speed: number;
    costPerKm: number
};

const vehicleTypeSchema = new Schema<IVehicleTypeModel>({
    vehicleType: { type: String },
    slug: { type: String },
    speed: { type: Number },
    costPerKm: { type: Number }
});

export interface IVehicleTypeModel extends Document, IVehicleType {}

const VehicleType = mongoose.model<IVehicleTypeModel>('VehicleType', vehicleTypeSchema);

export const $saveVehicleTypeSchema: Joi.SchemaMap<IVehicleTypeModel> = {
    vehicleType: Joi.string().required().label('Vehicle type'),
    slug: Joi.string().optional().label('slug'),
    speed: Joi.number().required().label('vehicle speed'),
    costPerKm: Joi.number().required().label('cost per km')
};

export const $updateVehicleTypeSchema: Joi.SchemaMap<IVehicleTypeModel> = {
    vehicleType: Joi.string().label('Vehicle type'),
    slug: Joi.string().optional().label('slug'),
    speed: Joi.number().label('vehicle speed'),
    costPerKm: Joi.number().label('cost per km')
};

export default VehicleType