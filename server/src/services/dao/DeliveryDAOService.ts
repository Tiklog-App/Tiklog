import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IDeliveryModel} from '../../models/Delivery';
import DeliveryRepository from '../../repositories/DeliveryRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class DeliveryDAOService implements ICrudDAO<IDeliveryModel> {
  private deliveryRepository: DeliveryRepository;

  constructor(deliveryRepository: DeliveryRepository) {
    this.deliveryRepository = deliveryRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IDeliveryModel>): Promise<IDeliveryModel[]> {
    return this.deliveryRepository.bulkCreate(records)
  }

  create(values: IDeliveryModel): Promise<IDeliveryModel> {
    return this.deliveryRepository.save(values);
  }

  findAll(filter?: FilterQuery<IDeliveryModel>, options?: QueryOptions): Promise<IDeliveryModel[]> {
    return this.deliveryRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IDeliveryModel | null> {
    return this.deliveryRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IDeliveryModel>, options?: QueryOptions): Promise<IDeliveryModel | null> {
    return this.deliveryRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IDeliveryModel>, options: QueryOptions): Promise<IDeliveryModel | null> {
    return this.deliveryRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IDeliveryModel>,
    update: UpdateQuery<IDeliveryModel>,
    options?: QueryOptions
  ): Promise<IDeliveryModel | null> {
    return this.deliveryRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IDeliveryModel>, options?: QueryOptions): Promise<void> {
    return this.deliveryRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.deliveryRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.deliveryRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IDeliveryModel>, options?: QueryOptions): Promise<boolean> {
    return this.deliveryRepository.exist(filter, options);
  }

}
