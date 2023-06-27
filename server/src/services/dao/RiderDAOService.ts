import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderModel} from '../../models/Rider';
import RiderRepository from '../../repositories/RiderRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class RiderDAOService implements ICrudDAO<IRiderModel> {
  private riderRepository: RiderRepository;

  constructor(riderRepository: RiderRepository) {
    this.riderRepository = riderRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderModel>): Promise<IRiderModel[]> {
    return this.riderRepository.bulkCreate(records)
  }

  create(values: IRiderModel): Promise<IRiderModel> {
    return this.riderRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderModel>, options?: QueryOptions): Promise<IRiderModel[]> {
    return this.riderRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderModel | null> {
    return this.riderRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderModel>, options?: QueryOptions): Promise<IRiderModel | null> {
    return this.riderRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderModel>, options: QueryOptions): Promise<IRiderModel | null> {
    return this.riderRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderModel>,
    update: UpdateQuery<IRiderModel>,
    options?: QueryOptions
  ): Promise<IRiderModel | null> {
    return this.riderRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderModel>, options?: QueryOptions): Promise<void> {
    return this.riderRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderRepository.exist(filter, options);
  }

}
