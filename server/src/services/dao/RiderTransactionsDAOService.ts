import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderTransactionsModel} from '../../models/RiderTransactions';
import RiderTransactionsRepository from '../../repositories/RiderTransactionsRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class RiderTransactionsDAOService implements ICrudDAO<IRiderTransactionsModel> {
  private riderTransactionsRepository: RiderTransactionsRepository;

  constructor(riderTransactionsRepository: RiderTransactionsRepository) {
    this.riderTransactionsRepository = riderTransactionsRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderTransactionsModel>): Promise<IRiderTransactionsModel[]> {
    return this.riderTransactionsRepository.bulkCreate(records)
  }

  create(values: IRiderTransactionsModel): Promise<IRiderTransactionsModel> {
    return this.riderTransactionsRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderTransactionsModel>, options?: QueryOptions): Promise<IRiderTransactionsModel[]> {
    return this.riderTransactionsRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderTransactionsModel | null> {
    return this.riderTransactionsRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderTransactionsModel>, options?: QueryOptions): Promise<IRiderTransactionsModel | null> {
    return this.riderTransactionsRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderTransactionsModel>, options: QueryOptions): Promise<IRiderTransactionsModel | null> {
    return this.riderTransactionsRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderTransactionsModel>,
    update: UpdateQuery<IRiderTransactionsModel>,
    options?: QueryOptions
  ): Promise<IRiderTransactionsModel | null> {
    return this.riderTransactionsRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderTransactionsModel>, options?: QueryOptions): Promise<void> {
    return this.riderTransactionsRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderTransactionsRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderTransactionsRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderTransactionsModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderTransactionsRepository.exist(filter, options);
  }

}
