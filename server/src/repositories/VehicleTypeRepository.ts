import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import VehicleType, { IVehicleTypeModel } from '../models/VehicleType';

export default class VehicleTypeRepository extends CrudRepository<IVehicleTypeModel, Types.ObjectId> {
  constructor() {
    super(VehicleType as Model<IVehicleTypeModel>);
  }
}