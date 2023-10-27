import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IRiderLicense {
    licenseNumber: string;
    issuedDate: Date;
    expiryDate: Date;
    licenseImageUrl: string;
    slug: string;
    isExpired: boolean;
    rider: mongoose.Types.ObjectId;
}

const riderLicenseSchema = new Schema<IRiderLicense>({
    licenseNumber: { type: String },
    issuedDate: { type: Date },
    expiryDate: { type: Date },
    licenseImageUrl: { type: String },
    slug: { type: String },
    isExpired: { type: Boolean },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
})

riderLicenseSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});

export interface IRiderLicenseModel extends Document, IRiderLicense {}

const RiderLicense = mongoose.model<IRiderLicenseModel>('RiderLicense', riderLicenseSchema);

export const $licenseSchema: Joi.SchemaMap<IRiderLicenseModel> = {
    licenseNumber: Joi.string().required().label('license number'),
    issuedDate: Joi.string().required().label('issued date'),
    expiryDate: Joi.string().required().label('expiry date')
};

export default RiderLicense;