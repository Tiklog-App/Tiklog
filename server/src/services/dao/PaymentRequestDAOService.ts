import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IPaymentRequestModel} from '../../models/PaymentRequest';
import PaymentRequestRepository from '../../repositories/PaymentRequestRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class WalletDAOService implements ICrudDAO<IPaymentRequestModel> {
  private paymentRequestRepository: PaymentRequestRepository;

  constructor(paymentRequestRepository: PaymentRequestRepository) {
    this.paymentRequestRepository = paymentRequestRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IPaymentRequestModel>): Promise<IPaymentRequestModel[]> {
    return this.paymentRequestRepository.bulkCreate(records)
  }

  create(values: IPaymentRequestModel): Promise<IPaymentRequestModel> {
    return this.paymentRequestRepository.save(values);
  }

  findAll(filter?: FilterQuery<IPaymentRequestModel>, options?: QueryOptions): Promise<IPaymentRequestModel[]> {
    return this.paymentRequestRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IPaymentRequestModel | null> {
    return this.paymentRequestRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IPaymentRequestModel>, options?: QueryOptions): Promise<IPaymentRequestModel | null> {
    return this.paymentRequestRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IPaymentRequestModel>, options: QueryOptions): Promise<IPaymentRequestModel | null> {
    return this.paymentRequestRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IPaymentRequestModel>,
    update: UpdateQuery<IPaymentRequestModel>,
    options?: QueryOptions
  ): Promise<IPaymentRequestModel | null> {
    return this.paymentRequestRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IPaymentRequestModel>, options?: QueryOptions): Promise<void> {
    return this.paymentRequestRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.paymentRequestRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.paymentRequestRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IPaymentRequestModel>, options?: QueryOptions): Promise<boolean> {
    return this.paymentRequestRepository.exist(filter, options);
  }

}
