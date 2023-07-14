import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import RiderLicense, { IRiderLicenseModel } from '../models/RiderLicense';

export default class RiderLicenseRepository extends CrudRepository<IRiderLicenseModel, Types.ObjectId> {
  constructor() {
    super(RiderLicense as Model<IRiderLicenseModel>);
  }
}