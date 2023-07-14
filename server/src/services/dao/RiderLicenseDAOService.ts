import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IRiderLicenseModel} from '../../models/RiderLicense';
import RiderLicenseRepository from '../../repositories/RiderLicenseRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class RiderLicenseDAOService implements ICrudDAO<IRiderLicenseModel> {
  private riderLicenseRepository: RiderLicenseRepository;

  constructor(riderLicenseRepository: RiderLicenseRepository) {
    this.riderLicenseRepository = riderLicenseRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IRiderLicenseModel>): Promise<IRiderLicenseModel[]> {
    return this.riderLicenseRepository.bulkCreate(records)
  }

  create(values: IRiderLicenseModel): Promise<IRiderLicenseModel> {
    return this.riderLicenseRepository.save(values);
  }

  findAll(filter?: FilterQuery<IRiderLicenseModel>, options?: QueryOptions): Promise<IRiderLicenseModel[]> {
    return this.riderLicenseRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IRiderLicenseModel | null> {
    return this.riderLicenseRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IRiderLicenseModel>, options?: QueryOptions): Promise<IRiderLicenseModel | null> {
    return this.riderLicenseRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IRiderLicenseModel>, options: QueryOptions): Promise<IRiderLicenseModel | null> {
    return this.riderLicenseRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IRiderLicenseModel>,
    update: UpdateQuery<IRiderLicenseModel>,
    options?: QueryOptions
  ): Promise<IRiderLicenseModel | null> {
    return this.riderLicenseRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IRiderLicenseModel>, options?: QueryOptions): Promise<void> {
    return this.riderLicenseRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.riderLicenseRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.riderLicenseRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IRiderLicenseModel>, options?: QueryOptions): Promise<boolean> {
    return this.riderLicenseRepository.exist(filter, options);
  }

}
