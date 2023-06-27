import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Package, { IPackageModel } from '../models/Package';

export default class CustomerLocationRepository extends CrudRepository<IPackageModel, Types.ObjectId> {
  constructor() {
    super(Package as Model<IPackageModel>);
  }
}