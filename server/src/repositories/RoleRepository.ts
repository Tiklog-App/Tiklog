import { Model, Types } from 'mongoose';
import Role, { IRoleModel } from '../models/Role';
import CrudRepository from '../helpers/CrudRepository';

export default class RoleRepository extends CrudRepository<IRoleModel, Types.ObjectId> {
  constructor() {
    super(Role as Model<IRoleModel>);
  }
}
