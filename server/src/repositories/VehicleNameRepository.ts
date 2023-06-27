import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import VehicleName, { IVehicleNameModel } from '../models/VehicleName';

export default class VehicleNameRepository extends CrudRepository<IVehicleNameModel, Types.ObjectId> {
  constructor() {
    super(VehicleName as Model<IVehicleNameModel>);
  }
}