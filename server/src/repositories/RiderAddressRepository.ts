import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import RiderAddress, { IRiderAddressModel } from '../models/RiderAddress';

export default class RiderAddressRepository extends CrudRepository<IRiderAddressModel, Types.ObjectId> {
  constructor() {
    super(RiderAddress as Model<IRiderAddressModel>);
  }
}