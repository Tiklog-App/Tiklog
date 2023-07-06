import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IRiderAddress {
    address_one: string;
    address_two: string;
    country: string;
    state: string;
    city: string;
    rider: mongoose.Types.ObjectId;
}

const riderAddressSchema = new Schema<IRiderAddress>({
    address_one: { type: String },
    address_two: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
});

export interface IRiderAddressModel extends Document, IRiderAddress {}

const RiderAddress = mongoose.model<IRiderAddressModel>('RiderAddress', riderAddressSchema);

export const $saveRiderAddress: Joi.SchemaMap = {
    address_one: Joi.string().required().label('address 1'),
    address_two: Joi.string().label('address 2'),
    country: Joi.string().required().label('country'),
    state: Joi.string().required().label('state'),
    city: Joi.string().required().label('city'),
};

export const $updateRiderAddress: Joi.SchemaMap = {
    address_one: Joi.string().label('address 1'),
    address_two: Joi.string().label('address 2'),
    country: Joi.string().label('country'),
    state: Joi.string().label('state'),
    city: Joi.string().label('city'),
};

export default RiderAddress;