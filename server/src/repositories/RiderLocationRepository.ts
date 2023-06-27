import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import RiderLocation, { IRiderLocationModel } from '../models/RiderLocation';

export default class RiderLocationRepository extends CrudRepository<IRiderLocationModel, Types.ObjectId> {
  constructor() {
    super(RiderLocation as Model<IRiderLocationModel>);
  }
}