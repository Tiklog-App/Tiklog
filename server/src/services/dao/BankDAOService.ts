import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IBankModel} from '../../models/Bank';
import BankRepository from '../../repositories/BankRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class BankDAOService implements ICrudDAO<IBankModel> {
  private bankRepository: BankRepository;

  constructor(bankRepository: BankRepository) {
    this.bankRepository = bankRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IBankModel>): Promise<IBankModel[]> {
    return this.bankRepository.bulkCreate(records)
  }

  create(values: IBankModel): Promise<IBankModel> {
    return this.bankRepository.save(values);
  }

  findAll(filter?: FilterQuery<IBankModel>, options?: QueryOptions): Promise<IBankModel[]> {
    return this.bankRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IBankModel | null> {
    return this.bankRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IBankModel>, options?: QueryOptions): Promise<IBankModel | null> {
    return this.bankRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IBankModel>, options: QueryOptions): Promise<IBankModel | null> {
    return this.bankRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IBankModel>,
    update: UpdateQuery<IBankModel>,
    options?: QueryOptions
  ): Promise<IBankModel | null> {
    return this.bankRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IBankModel>, options?: QueryOptions): Promise<void> {
    return this.bankRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.bankRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.bankRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IBankModel>, options?: QueryOptions): Promise<boolean> {
    return this.bankRepository.exist(filter, options);
  }

}
