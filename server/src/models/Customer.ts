import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface ICustomer {
  token: string;
  firstName: string;
  lastName: string;
  other_names: string;
  password: string | null;
  confirm_password: string | null;
  email: string | null;
  phone: string;
  gender: string;
  profileImageUrl: string | null;
  active: boolean | null;
  loginToken: string | null;
  loginDate: Date | null;
  dob: Date;
  previous_password: string;
  googleId: string | null;
  instagramId: string | null;
  facebookId: string | null;
  roles: mongoose.Types.ObjectId[];
  level: number;
  passwordResetCode: string | null;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  firstName: { type: String },
  lastName: { type: String },
  other_names: { type: String },
  dob: { type: Date },
  password: { type: String, allowNull: true },
  confirm_password: { type: String, allowNull: true },
  email: { type: String, allowNull: true },
  phone: { type: String },
  gender: { type: String },
  profileImageUrl: { type: String, allowNull: true },
  active: { type: Boolean, allowNull: true },
  loginToken: { type: String, allowNull: true },
  loginDate: { type: Date, allowNull: true },
  googleId: { type: String, allowNull: true },
  instagramId: { type: String, allowNull: true },
  facebookId: { type: String, allowNull: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  level: { type: Number, default: 0 },
  passwordResetCode: { type: String, allowNull: true },
  createdAt: { type: Date, default: Date.now }
});

// customerSchema.pre('remove', async function (next) {
//   const childrenIds = this.children;
//   // Delete all associated child documents
//   await Child.deleteMany({ _id: { $in: childrenIds } });

//   next();
// });

customerSchema.pre('find', function (next) {
  this.populate({
    path: 'roles',
    select: '_id name slug permissions'
  });
  next();
});

export interface ICustomerModel extends Document, ICustomer {}

const Customer = mongoose.model<ICustomerModel>('Customer', customerSchema);

export const $saveCustomerSchema: Joi.SchemaMap = {
  password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password"),
  phone: Joi.string().required().label('phone')
};

export const $updateCustomerSchema: Joi.SchemaMap = {
  firstName: Joi.string().label('first name'),
  lastName: Joi.string().label('last name'),
  email: Joi.string().label('email'),
  other_names: Joi.string().required().label('other names'),
  dob: Joi.string().required().label('date of birth'),
  gender: Joi.string().required().label('gender'),
  profileImageUrl: Joi.string().label('profile image'),
  phone: Joi.string().label('phone')
};

export const $editCustomerProfileSchema: Joi.SchemaMap = {
  firstName: Joi.string().label('first name'),
  lastName: Joi.string().label('last name'),
  email: Joi.string().label('email'),
  other_names: Joi.string().label('other names'),
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

export const $finishSavingCustomer: Joi.SchemaMap = {
  token: Joi.string().required().label('token'),
  phone: Joi.string().required().label('phone')
};

export const $loginSchemaCustomer: Joi.SchemaMap = {
    phone: Joi.string().required().label('phone'),
    password: Joi.string()
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password')
}

export default Customer;
