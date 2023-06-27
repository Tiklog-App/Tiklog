import mongoose, { Document, Schema } from 'mongoose';
import Joi from 'joi';

interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirm_password: string;
  email: string;
  phone: string;
  gender: string;
  previous_password: string;
  // profileImageUrl: string | null;
  active: boolean | null;
  loginToken: string | null;
  loginDate: Date | null;
  roles: mongoose.Types.ObjectId[];
  role: string
}

const userSchema = new Schema<IUser>({
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String },
  confirm_password: { type: String },
  email: { type: String },
  phone: { type: String },
  gender: { type: String },
  // profileImageUrl: { type: String, allowNull: true },
  active: { type: Boolean, allowNull: true },
  loginToken: { type: String, allowNull: true },
  loginDate: { type: Date, allowNull: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }]
});

userSchema.pre('find', function (next) {
  this.populate({
    path: 'roles',
    select: '_id name slug permissions'
  });
  next();
});

export interface IUserModel extends Document, IUser {}

const User = mongoose.model<IUserModel>('User', userSchema);

export const $saveUserSchema: Joi.SchemaMap = {
  firstName: Joi.string().required().label('firstName'),
  lastName: Joi.string().required().label('lastName'),
  email: Joi.string().required().label('email'),
  phone: Joi.string().required().label('phone'),
  gender: Joi.string().required().label('gender'),
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*\W)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/)
    .messages({
      'string.pattern.base': `Password does not meet requirements.`,
    })
    .required()
    .label('password'),
  confirm_password: Joi.string().optional().label('confirm_password'),
  role: Joi.string().required().label('role'),
};

export const $updateUserSchema: Joi.SchemaMap = {
  firstName: Joi.string().label('firstName'),
  lastName: Joi.string().label('lastName'),
  email: Joi.string().label('email'),
  gender: Joi.string().label('gender'),
  phone: Joi.string().label('phone'),
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

export default User;
