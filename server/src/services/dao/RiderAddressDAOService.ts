import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderAddressModel} from '../../models/RiderAddress';
import RiderAddressRepository from '../../repositories/RiderAddressRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class RiderAddressDAOService implements ICrudDAO<IRiderAddressModel> {
  private riderAddressRepository: RiderAddressRepository;

  constructor(riderAddressRepository: RiderAddressRepository) {
    this.riderAddressRepository = riderAddressRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderAddressModel>): Promise<IRiderAddressModel[]> {
    return this.riderAddressRepository.bulkCreate(records)
  }

  create(values: IRiderAddressModel): Promise<IRiderAddressModel> {
    return this.riderAddressRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderAddressModel>, options?: QueryOptions): Promise<IRiderAddressModel[]> {
    return this.riderAddressRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderAddressModel | null> {
    return this.riderAddressRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderAddressModel>, options?: QueryOptions): Promise<IRiderAddressModel | null> {
    return this.riderAddressRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderAddressModel>, options: QueryOptions): Promise<IRiderAddressModel | null> {
    return this.riderAddressRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderAddressModel>,
    update: UpdateQuery<IRiderAddressModel>,
    options?: QueryOptions
  ): Promise<IRiderAddressModel | null> {
    return this.riderAddressRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderAddressModel>, options?: QueryOptions): Promise<void> {
    return this.riderAddressRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderAddressRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderAddressRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderAddressModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderAddressRepository.exist(filter, options);
  }

}