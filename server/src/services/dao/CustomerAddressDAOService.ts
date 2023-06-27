import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {ICustomerAddressModel} from '../../models/CustomerAddress';
import CustomerAddressRepository from '../../repositories/CustomerAddressRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerAddressDAOService implements ICrudDAO<ICustomerAddressModel> {
  private customerAddressRepository: CustomerAddressRepository;

  constructor(customerAddressRepository: CustomerAddressRepository) {
    this.customerAddressRepository = customerAddressRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<ICustomerAddressModel>): Promise<ICustomerAddressModel[]> {
    return this.customerAddressRepository.bulkCreate(records)
  }

  create(values: ICustomerAddressModel): Promise<ICustomerAddressModel> {
    return this.customerAddressRepository.save(values);
  }

  findAll(filter?: FilterQuery<ICustomerAddressModel>, options?: QueryOptions): Promise<ICustomerAddressModel[]> {
    return this.customerAddressRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<ICustomerAddressModel | null> {
    return this.customerAddressRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<ICustomerAddressModel>, options?: QueryOptions): Promise<ICustomerAddressModel | null> {
    return this.customerAddressRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<ICustomerAddressModel>, options: QueryOptions): Promise<ICustomerAddressModel | null> {
    return this.customerAddressRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<ICustomerAddressModel>,
    update: UpdateQuery<ICustomerAddressModel>,
    options?: QueryOptions
  ): Promise<ICustomerAddressModel | null> {
    return this.customerAddressRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<ICustomerAddressModel>, options?: QueryOptions): Promise<void> {
    return this.customerAddressRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.customerAddressRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.customerAddressRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<ICustomerAddressModel>, options?: QueryOptions): Promise<boolean> {
    return this.customerAddressRepository.exist(filter, options);
  }

}
