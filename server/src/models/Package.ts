import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IPackage {
    type: string,
    // size: string,
    slug: string,
    adminId: string
}

const packageSchema = new Schema<IPackage>({
    type: { type: String },
    // size: { type: String },
    slug: { type: String },
    adminId: { type: String, allowNull: false }
});

export interface IPackageModel extends Document, IPackage {}

const Package = mongoose.model<IPackageModel>('Package', packageSchema);

export const $savePackage: Joi.SchemaMap = {
    type: Joi.string().required().label('package type'),
    // size: Joi.string().optional().allow('').label('package size'),
};

export const $updatePackage: Joi.SchemaMap = {
    type: Joi.string().label('package type'),
    // size: Joi.string().label('package size'),
};

export default Package;