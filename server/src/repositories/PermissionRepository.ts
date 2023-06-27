import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Permission, { IPermissionModel } from '../models/Permission';

export default class PermissionRepository extends CrudRepository<IPermissionModel, Types.ObjectId> {
  constructor() {
    super(Permission as Model<IPermissionModel>);
  }
};