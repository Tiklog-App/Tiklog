import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Permission, {IPermissionModel} from '../../models/Permission';
import PermissionRepository from '../../repositories/PermissionRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class PermissionDAOService implements ICrudDAO<IPermissionModel> {
  private permissionRepository: PermissionRepository;

  constructor(permissionRepository: PermissionRepository) {
    this.permissionRepository = permissionRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IPermissionModel>): Promise<IPermissionModel[]> {
    return this.permissionRepository.bulkCreate(records)
  }

  create(values: IPermissionModel): Promise<IPermissionModel> {
    return this.permissionRepository.save(values);
  }

  findAll(filter?: FilterQuery<IPermissionModel>, options?: QueryOptions): Promise<IPermissionModel[]> {
    return this.permissionRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IPermissionModel | null> {
    return this.permissionRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IPermissionModel>, options?: QueryOptions): Promise<IPermissionModel | null> {
    return this.permissionRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IPermissionModel>, options: QueryOptions): Promise<IPermissionModel | null> {
    return this.permissionRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IPermissionModel>,
    update: UpdateQuery<IPermissionModel>,
    options?: QueryOptions
  ): Promise<IPermissionModel | null> {
    return this.permissionRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IPermissionModel>, options?: QueryOptions): Promise<void> {
    return this.permissionRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.permissionRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.permissionRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IPermissionModel>, options?: QueryOptions): Promise<boolean> {
    return this.permissionRepository.exist(filter, options);
  }

}
