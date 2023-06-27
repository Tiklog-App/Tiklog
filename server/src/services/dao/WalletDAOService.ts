import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IWalletModel} from '../../models/Wallet';
import WalletRepository from '../../repositories/WalletRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class WalletDAOService implements ICrudDAO<IWalletModel> {
  private walletRepository: WalletRepository;

  constructor(walletRepository: WalletRepository) {
    this.walletRepository = walletRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IWalletModel>): Promise<IWalletModel[]> {
    return this.walletRepository.bulkCreate(records)
  }

  create(values: IWalletModel): Promise<IWalletModel> {
    return this.walletRepository.save(values);
  }

  findAll(filter?: FilterQuery<IWalletModel>, options?: QueryOptions): Promise<IWalletModel[]> {
    return this.walletRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IWalletModel | null> {
    return this.walletRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IWalletModel>, options?: QueryOptions): Promise<IWalletModel | null> {
    return this.walletRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IWalletModel>, options: QueryOptions): Promise<IWalletModel | null> {
    return this.walletRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IWalletModel>,
    update: UpdateQuery<IWalletModel>,
    options?: QueryOptions
  ): Promise<IWalletModel | null> {
    return this.walletRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IWalletModel>, options?: QueryOptions): Promise<void> {
    return this.walletRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.walletRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.walletRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IWalletModel>, options?: QueryOptions): Promise<boolean> {
    return this.walletRepository.exist(filter, options);
  }

}
