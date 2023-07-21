import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderWalletModel} from '../../models/RiderWallet';
import RiderWalletRepository from '../../repositories/RiderWalletRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class WalletDAOService implements ICrudDAO<IRiderWalletModel> {
  private riderWalletRepository: RiderWalletRepository;

  constructor(riderWalletRepository: RiderWalletRepository) {
    this.riderWalletRepository = riderWalletRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderWalletModel>): Promise<IRiderWalletModel[]> {
    return this.riderWalletRepository.bulkCreate(records)
  }

  create(values: IRiderWalletModel): Promise<IRiderWalletModel> {
    return this.riderWalletRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderWalletModel>, options?: QueryOptions): Promise<IRiderWalletModel[]> {
    return this.riderWalletRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderWalletModel | null> {
    return this.riderWalletRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderWalletModel>, options?: QueryOptions): Promise<IRiderWalletModel | null> {
    return this.riderWalletRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderWalletModel>, options: QueryOptions): Promise<IRiderWalletModel | null> {
    return this.riderWalletRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderWalletModel>,
    update: UpdateQuery<IRiderWalletModel>,
    options?: QueryOptions
  ): Promise<IRiderWalletModel | null> {
    return this.riderWalletRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderWalletModel>, options?: QueryOptions): Promise<void> {
    return this.riderWalletRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderWalletRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderWalletRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderWalletModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderWalletRepository.exist(filter, options);
  }

}
