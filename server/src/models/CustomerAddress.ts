import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface ICustomerAddress {
    address_type: string;
    address: string;
    street: string | null;
    country: string;
    state: string;
    city: string;
    favorite: boolean;
    customer: mongoose.Types.ObjectId;
}

const customerAddressSchema = new Schema<ICustomerAddress>({
    address_type: { type: String },
    address: { type: String },
    street: { type: String, allowNull: true },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    favorite: { type: Boolean },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' }
});

export interface ICustomerAddressModel extends Document, ICustomerAddress {}

const CustomerAddress = mongoose.model<ICustomerAddressModel>('CustomerAddress', customerAddressSchema);

export const $saveCustomerAddress: Joi.SchemaMap = {
    address_type: Joi.string().required().label('address type'),
    address: Joi.string().required().label('address'),
    street: Joi.string().required().label('street'),
    country: Joi.string().required().label('country'),
    state: Joi.string().required().label('state'),
    city: Joi.string().required().label('city'),
};

export const $updateCustomerAddress: Joi.SchemaMap = {
    address_type: Joi.string().label('address type'),
    address: Joi.string().label('address'),
    street: Joi.string().label('street'),
    country: Joi.string().label('country'),
    state: Joi.string().label('state'),
    city: Joi.string().label('city'),
};

export default CustomerAddress;