import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IRider {
  token: string;
  firstName: string;
  lastName: string;
  other_names: string;
  password: string | null;
  confirm_password: string | null;
  email: string;
  phone: string;
  gender: string;
  profileImageUrl: string | null;
  active: boolean | null;
  loginToken: string | null;
  loginDate: Date | null;
  roles?: mongoose.Types.ObjectId[];
  dob: Date;
  previous_password: string;
  googleId: string | null;
  facebookId: string | null;
  status: string;
  level: number;
  passwordResetCode: string;
}

const riderSchema = new Schema<IRider>({
  token: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  other_names: { type: String },
  dob: { type: Date },
  password: { type: String },
  confirm_password: { type: String },
  email: { type: String },
  phone: { type: String },
  gender: { type: String },
  profileImageUrl: { type: String, allowNull: true },
  active: { type: Boolean, allowNull: true },
  loginToken: { type: String, allowNull: true },
  loginDate: { type: Date, allowNull: true },
  googleId: { type: String, allowNull: true },
  facebookId: { type: String, allowNull: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  status: { type: String },
  level: { type: Number, default: 0 },
  passwordResetCode: { type: String, allowNull: true }
});

riderSchema.pre('find', function (next) {
  this.populate({
    path: 'roles',
    select: '_id name slug permissions'
  });
  next();
});

export interface IRiderModel extends Document, IRider {}

const Rider = mongoose.model<IRiderModel>('Rider', riderSchema);

export const $saveRiderSchema: Joi.SchemaMap = {
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password"),
  phone: Joi.string().required().label('phone'),
};

export const $updateRiderSchema: Joi.SchemaMap = {
  firstName: Joi.string().label('first name'),
  lastName: Joi.string().label('last name'),
  email: Joi.string().required().label('email'),
  other_names: Joi.string().required().label('other names'),
  dob: Joi.any().required().label('date of birth'),
  gender: Joi.string().required().label('gender'),
  profileImageUrl: Joi.string().label('profile image'),
  phone: Joi.string().label('phone')
};

export const $editRiderProfileSchema: Joi.SchemaMap = {
  firstName: Joi.string().label('first name'),
  lastName: Joi.string().label('last name'),
  email: Joi.string().label('email'),
  other_names: Joi.string().label('other names'),
  gender: Joi.string().label('gender'),
  profileImageUrl: Joi.string().label('profile image'),
  phone: Joi.string().label('phone')
};

export const $changePassword: Joi.SchemaMap = {
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password"),
  previous_password: Joi.string().required().label('previous password')
};

export const $resetPassword: Joi.SchemaMap = {
  email: Joi.string().required().label('email')
};

export const $savePasswordAfterReset: Joi.SchemaMap = {
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password"),
  email: Joi.string().required().label('email')
};

export const $savePassword: Joi.SchemaMap = {
  email: Joi.string().required().label('email'),
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password"),
  token: Joi.string().required().label("token")
};

export const $finishSavingRider: Joi.SchemaMap = {
  token: Joi.string().required().label('token'),
  phone: Joi.string().required().label('phone')
};

export const $loginSchemaRider: Joi.SchemaMap = {
  phone: Joi.string().required().label('phone'),
  password: Joi.string()
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
  .messages({
    'string.pattern.base': `Password does not meet requirements.`,
  })
  .required()
  .label('password'),
}

export default Rider;
