import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface ICustomer {
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
  dob: Date;
  previous_password: string;
  googleId: string | null;
  appleId: string | null;
  facebookId: string | null;
  roles: mongoose.Types.ObjectId[];
}

const customerSchema = new Schema<ICustomer>({
  firstName: { type: String },
  lastName: { type: String },
  other_names: { type: String },
  dob: { type: Date },
  password: { type: String, allowNull: true },
  confirm_password: { type: String, allowNull: true },
  email: { type: String },
  phone: { type: String },
  gender: { type: String },
  profileImageUrl: { type: String, allowNull: true },
  active: { type: Boolean, allowNull: true },
  loginToken: { type: String, allowNull: true },
  loginDate: { type: Date, allowNull: true },
  googleId: { type: String, allowNull: true },
  appleId: { type: String, allowNull: true },
  facebookId: { type: String, allowNull: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }]
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
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
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
  dob: Joi.any().required().label('date of birth'),
  gender: Joi.string().required().label('gender'),
  profileImageUrl: Joi.string().label('profile image'),
  phone: Joi.string().label('phone')
};

export const $changePassword: Joi.SchemaMap = {
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
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
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.ref("password")
};

export const $savePassword: Joi.SchemaMap = {
  email: Joi.string().required().label('email'),
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
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

export const $loginSchema: Joi.SchemaMap = {
    phone: Joi.string().optional().label('phone'),
    password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password')
}

export default Customer;
