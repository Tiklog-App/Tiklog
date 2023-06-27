import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {ICustomerModel} from '../../models/Customer';
import CustomerRepository from '../../repositories/CustomerRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerDAOService implements ICrudDAO<ICustomerModel> {
  private customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<ICustomerModel>): Promise<ICustomerModel[]> {
    return this.customerRepository.bulkCreate(records)
  }

  create(values: ICustomerModel): Promise<ICustomerModel> {
    return this.customerRepository.save(values);
  }

  findAll(filter?: FilterQuery<ICustomerModel>, options?: QueryOptions): Promise<ICustomerModel[]> {
    return this.customerRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<ICustomerModel | null> {
    return this.customerRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<ICustomerModel>, options?: QueryOptions): Promise<ICustomerModel | null> {
    return this.customerRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<ICustomerModel>, options: QueryOptions): Promise<ICustomerModel | null> {
    return this.customerRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<ICustomerModel>,
    update: UpdateQuery<ICustomerModel>,
    options?: QueryOptions
  ): Promise<ICustomerModel | null> {
    return this.customerRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<ICustomerModel>, options?: QueryOptions): Promise<void> {
    return this.customerRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.customerRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.customerRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<ICustomerModel>, options?: QueryOptions): Promise<boolean> {
    return this.customerRepository.exist(filter, options);
  }

}
