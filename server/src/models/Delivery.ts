import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IDelivery {
  senderName: string,
  senderAddress: string,
  senderLocation: {
    type: "Point",
    coordinates: [number, number]
  },
  senderPhone: string,
  recipientName: string,
  recipientAddress: string,
  recipientLocation: {
    type: "Point",
    coordinates: [number, number]
  },
  recipientPhone: string,
  packageSize: string,
  packageType: string,
  vehicle: string,
  packageOtherDetails: string,
  status: string,
  deliveryTime: Date,
  pickupTime: Date,
  item: string,
  estimateValue: string,
  rating: number | null,
  deliveryFee: number,
  riderName: string,
  riderPhone: string,
  rider: mongoose.Types.ObjectId | null,
  customer: mongoose.Types.ObjectId,
  estimatedDeliveryTime: string,
  deliveryRefNumber: string
};

const deliverySchema = new Schema<IDelivery>({
  senderName: { type: String },
  senderAddress: { type: String },
  senderLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  senderPhone: { type: String },
  recipientName: { type: String },
  recipientAddress: { type: String },
  recipientLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  recipientPhone: { type: String },
  packageSize: { type: String },
  packageType: { type: String },
  vehicle: { type: String },
  packageOtherDetails: { type: String },
  status: { type: String },
  deliveryTime: { type: Date },
  pickupTime: { type: Date },
  item: { type: String },
  estimateValue: { type: String },
  rating: { type: Number, allowNull: true },
  deliveryFee: { type: Number },
  riderName: { type: String },
  riderPhone: { type: String },
  rider: { type: Schema.Types.ObjectId, ref: 'Rider', allowNull: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  estimatedDeliveryTime: { type: String },
  deliveryRefNumber: { type: String }
});

deliverySchema.index({ senderLocation: '2dsphere' });
deliverySchema.index({ recipientLocation: '2dsphere' });

export interface IDeliveryModel extends Document, IDelivery {}

const Delivery = mongoose.model<IDeliveryModel>('Delivery', deliverySchema);

export const $deliverySchema: Joi.SchemaMap = {
  senderName: Joi.string().required().label('Sender Name'),
  senderAddress: Joi.string().required().label('Sender Address'),
  senderLon: Joi.number().required().label('Sender Longitude'),
  senderLat: Joi.number().required().label('Sender Latitude'),
  senderPhone: Joi.string().required().label('Sender Phone'),
  recipientName: Joi.string().required().label('Recipient Name'),
  recipientAddress: Joi.string().required().label('Recipient Address'),
  recipientLon: Joi.number().required().label('Recipient Longitude'),
  recipientLat: Joi.number().required().label('Recipient Latitude'),
  recipientPhone: Joi.string().required().label('Recipient Phone'),
  packageSize: Joi.string().required().label('Package Size'),
  packageType: Joi.string().required().label('Package Type'),
  vehicle: Joi.string().required().label('Vehicle'),
  packageOtherDetails: Joi.string().label('Package Detail'),
  item: Joi.string().required().label('Item'),
  itemEstimateValue: Joi.number().required().label('Item Estimate Value'),
  rating: Joi.number().allow(null).label('Rating')
};

export const $editDeliverySchema: Joi.SchemaMap = {
  senderName: Joi.string().label('Sender Name'),
  senderAddress: Joi.string().label('Sender Address'),
  senderLon: Joi.number().label('Sender Longitude'),
  senderLat: Joi.number().label('Sender Latitude'),
  senderPhone: Joi.string().label('Sender Phone'),
  recipientName: Joi.string().label('Recipient Name'),
  recipientAddress: Joi.string().label('Recipient Address'),
  recipientLon: Joi.number().label('Recipient Longitude'),
  recipientLat: Joi.number().label('Recipient Latitude'),
  recipientPhone: Joi.string().label('Recipient Phone'),
  packageSize: Joi.string().label('Package Size'),
  packageType: Joi.string().label('Package Type'),
  vehicle: Joi.string().label('Vehicle'),
  packageOtherDetails: Joi.string().label('Package Detail'),
  item: Joi.string().label('Item'),
  itemEstimateValue: Joi.number().label('Item Estimate Value'),
  rating: Joi.number().allow(null).label('Rating')
};

export const $updateDeliverySchema: Joi.SchemaMap = {
  deliveryTime: Joi.date().label('Delivery Time'),
  pickupTime: Joi.date().label('Pickup Time'),
  riderName: Joi.string().label('Rider Name'),
  riderPhone: Joi.string().label('Rider Phone')
}

export default Delivery;