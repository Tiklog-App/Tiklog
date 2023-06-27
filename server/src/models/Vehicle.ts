import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IVehicle {
    vehicleType: string;
    vehicleName: string;
    vehicleModel: string;
    vehicleColor: string;
    licencePlateNumber: string;
    vehicleImageUrl: string;
    slug: string;
    rider: mongoose.Types.ObjectId;
}

const vehicleSchema = new Schema<IVehicle>({
    vehicleType: { type: String },
    vehicleName: { type: String },
    vehicleModel: { type: String },
    vehicleColor: { type: String },
    licencePlateNumber: { type: String },
    slug: { type: String },
    vehicleImageUrl: { type: String },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
})

vehicleSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});

export interface IVehicleModel extends Document, IVehicle {}

const Vehicle = mongoose.model<IVehicleModel>('Vehicle', vehicleSchema);

export const $saveVehicleSchema: Joi.SchemaMap<IVehicleModel> = {
    vehicleType: Joi.string().required().label('vehicle type'),
    slug: Joi.string().optional().label('slug'),
    vehicleName: Joi.string().required().label('vehicle name'),
    vehicleModel: Joi.string().required().label('vehicle model'),
    vehicleColor: Joi.string().required().label('vehicle color'),
    licencePlateNumber: Joi.string().required().label('licence plate number'),
    vehicleImageUrl: Joi.string().label('vehicle image'),
};

export const $updateVehicleSchema: Joi.SchemaMap<IVehicleModel> = {
    vehicleType: Joi.string().label('vehicle type'),
    slug: Joi.string().optional().label('slug'),
    vehicleName: Joi.string().label('vehicle name'),
    vehicleModel: Joi.string().label('vehicle model'),
    vehicleColor: Joi.string().label('vehicle color'),
    licencePlateNumber: Joi.string().label('licence plate number'),
    vehicleImageUrl: Joi.string().label('vehicle image'),
};

export default Vehicle;