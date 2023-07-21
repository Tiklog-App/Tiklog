import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import AdminFee, { IAdminFeeModel } from '../models/AdminFee';

export default class AdminFeeRepository extends CrudRepository<IAdminFeeModel, Types.ObjectId> {
  constructor() {
    super(AdminFee as Model<IAdminFeeModel>);
  }
}