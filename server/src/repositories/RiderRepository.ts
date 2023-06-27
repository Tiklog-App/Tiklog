import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Driver, { IRiderModel } from '../models/Rider';

export default class RiderRepository extends CrudRepository<IRiderModel, Types.ObjectId> {
  constructor() {
    super(Driver as Model<IRiderModel>);
  }
}