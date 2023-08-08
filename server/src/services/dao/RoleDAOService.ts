import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Role, {IRoleModel} from '../../models/Role';
import RoleRepository from '../../repositories/RoleRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class RoleDAOService implements ICrudDAO<IRoleModel> {
  private roleRepository: RoleRepository;

  constructor(roleRepository: RoleRepository) {
    this.roleRepository = roleRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IUserModel>): Promise<IUserModel[]> {
    return this.roleRepository.bulkCreate(records)
  }

  create(values: IRoleModel): Promise<IRoleModel> {
    return this.roleRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRoleModel>, options?: QueryOptions): Promise<IRoleModel[]> {
    return this.roleRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRoleModel | null> {
    return this.roleRepository.findById(id, options);
  }

  findByIdPopulatePermissions(id: any, options?: QueryOptions): Promise<IRoleModel | null> {
    return this.roleRepository.findByIdPopulatePermissions(id, options);
  }

  findByAnyPopulatePermissions(filter: FilterQuery<IRoleModel>, options?: QueryOptions): Promise<IRoleModel | null> {
    return this.roleRepository.findByAnyPopulatePermissions(filter, options);
  }

  findByAny(filter: FilterQuery<IRoleModel>, options?: QueryOptions): Promise<IRoleModel | null> {
    return this.roleRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRoleModel>, options: QueryOptions): Promise<IRoleModel | null> {
    return this.roleRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRoleModel>,
    update: UpdateQuery<IRoleModel>,
    options?: QueryOptions
  ): Promise<IRoleModel | null> {
    return this.roleRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRoleModel>, options?: QueryOptions): Promise<void> {
    return this.roleRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.roleRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.roleRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRoleModel>, options?: QueryOptions): Promise<boolean> {
    return this.roleRepository.exist(filter, options);
  }

}
