import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IAdminFeeModel} from '../../models/AdminFee';
import AdminFeeRepository from '../../repositories/AdminFeeRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class WalletDAOService implements ICrudDAO<IAdminFeeModel> {
  private adminFeeRepository: AdminFeeRepository;

  constructor(adminFeeRepository: AdminFeeRepository) {
    this.adminFeeRepository = adminFeeRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IAdminFeeModel>): Promise<IAdminFeeModel[]> {
    return this.adminFeeRepository.bulkCreate(records)
  }

  create(values: IAdminFeeModel): Promise<IAdminFeeModel> {
    return this.adminFeeRepository.save(values);
  }

  findAll(filter?: FilterQuery<IAdminFeeModel>, options?: QueryOptions): Promise<IAdminFeeModel[]> {
    return this.adminFeeRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IAdminFeeModel | null> {
    return this.adminFeeRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IAdminFeeModel>, options?: QueryOptions): Promise<IAdminFeeModel | null> {
    return this.adminFeeRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IAdminFeeModel>, options: QueryOptions): Promise<IAdminFeeModel | null> {
    return this.adminFeeRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IAdminFeeModel>,
    update: UpdateQuery<IAdminFeeModel>,
    options?: QueryOptions
  ): Promise<IAdminFeeModel | null> {
    return this.adminFeeRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IAdminFeeModel>, options?: QueryOptions): Promise<void> {
    return this.adminFeeRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.adminFeeRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.adminFeeRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IAdminFeeModel>, options?: QueryOptions): Promise<boolean> {
    return this.adminFeeRepository.exist(filter, options);
  }

}
