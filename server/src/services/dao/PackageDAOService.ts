import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IPackageModel} from '../../models/Package';
import PackageRepository from '../../repositories/PackageRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class PackageDAOService implements ICrudDAO<IPackageModel> {
  private packageRepository: PackageRepository;

  constructor(packageRepository: PackageRepository) {
    this.packageRepository = packageRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IPackageModel>): Promise<IPackageModel[]> {
    return this.packageRepository.bulkCreate(records)
  }

  create(values: IPackageModel): Promise<IPackageModel> {
    return this.packageRepository.save(values);
  }

  findAll(filter?: FilterQuery<IPackageModel>, options?: QueryOptions): Promise<IPackageModel[]> {
    return this.packageRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IPackageModel | null> {
    return this.packageRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IPackageModel>, options?: QueryOptions): Promise<IPackageModel | null> {
    return this.packageRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IPackageModel>, options: QueryOptions): Promise<IPackageModel | null> {
    return this.packageRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IPackageModel>,
    update: UpdateQuery<IPackageModel>,
    options?: QueryOptions
  ): Promise<IPackageModel | null> {
    return this.packageRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IPackageModel>, options?: QueryOptions): Promise<void> {
    return this.packageRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.packageRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.packageRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IPackageModel>, options?: QueryOptions): Promise<boolean> {
    return this.packageRepository.exist(filter, options);
  }

}
