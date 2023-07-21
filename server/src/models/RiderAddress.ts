import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IRiderAddress {
    address: string;
    street: string;
    country: string;
    state: string;
    city: string;
    rider: mongoose.Types.ObjectId;
}

const riderAddressSchema = new Schema<IRiderAddress>({
    address: { type: String },
    street: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
});

export interface IRiderAddressModel extends Document, IRiderAddress {}

const RiderAddress = mongoose.model<IRiderAddressModel>('RiderAddress', riderAddressSchema);

export const $saveRiderAddress: Joi.SchemaMap = {
    address: Joi.string().required().label('address 1'),
    street: Joi.string().label('address 2'),
    country: Joi.string().required().label('country'),
    state: Joi.string().required().label('state'),
    city: Joi.string().required().label('city'),
};

export const $updateRiderAddress: Joi.SchemaMap = {
    address: Joi.string().label('address 1'),
    street: Joi.string().label('address 2'),
    country: Joi.string().label('country'),
    state: Joi.string().label('state'),
    city: Joi.string().label('city'),
};

export default RiderAddress;