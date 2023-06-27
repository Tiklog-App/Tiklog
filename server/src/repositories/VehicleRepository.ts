import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Vehicle, { IVehicleModel } from '../models/Vehicle';

export default class VehicleRepository extends CrudRepository<IVehicleModel, Types.ObjectId> {
  constructor() {
    super(Vehicle as Model<IVehicleModel>);
  }
}