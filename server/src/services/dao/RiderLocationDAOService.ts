import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderLocationModel} from '../../models/RiderLocation';
import RiderLocationRepository from '../../repositories/RiderLocationRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerLocationDAOService implements ICrudDAO<IRiderLocationModel> {
  private riderLocationRepository: RiderLocationRepository;

  constructor(riderLocationRepository: RiderLocationRepository) {
    this.riderLocationRepository = riderLocationRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderLocationModel>): Promise<IRiderLocationModel[]> {
    return this.riderLocationRepository.bulkCreate(records)
  }

  create(values: IRiderLocationModel): Promise<IRiderLocationModel> {
    return this.riderLocationRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderLocationModel>, options?: QueryOptions): Promise<IRiderLocationModel[]> {
    return this.riderLocationRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderLocationModel | null> {
    return this.riderLocationRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderLocationModel>, options?: QueryOptions): Promise<IRiderLocationModel | null> {
    return this.riderLocationRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderLocationModel>, options: QueryOptions): Promise<IRiderLocationModel | null> {
    return this.riderLocationRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderLocationModel>,
    update: UpdateQuery<IRiderLocationModel>,
    options?: QueryOptions
  ): Promise<IRiderLocationModel | null> {
    return this.riderLocationRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderLocationModel>, options?: QueryOptions): Promise<void> {
    return this.riderLocationRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderLocationRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderLocationRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderLocationModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderLocationRepository.exist(filter, options);
  }

}
