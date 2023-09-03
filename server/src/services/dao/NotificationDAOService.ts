import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {INotificationModel} from '../../models/Notification';
import NotificationRepository from '../../repositories/NotificationRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class NotificationDAOService implements ICrudDAO<INotificationModel> {
  private notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<INotificationModel>): Promise<INotificationModel[]> {
    return this.notificationRepository.bulkCreate(records)
  }

  create(values: INotificationModel): Promise<INotificationModel> {
    return this.notificationRepository.save(values);
  }

  findAll(filter?: FilterQuery<INotificationModel>, options?: QueryOptions): Promise<INotificationModel[]> {
    return this.notificationRepository.findAll(filter, options);
  }

  findAllRiderRequest(filter?: FilterQuery<INotificationModel>, options?: QueryOptions): Promise<INotificationModel[]> {
    return this.notificationRepository.findAllRiderRequest(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<INotificationModel | null> {
    return this.notificationRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<INotificationModel>, options?: QueryOptions): Promise<INotificationModel | null> {
    return this.notificationRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<INotificationModel>, options: QueryOptions): Promise<INotificationModel | null> {
    return this.notificationRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<INotificationModel>,
    update: UpdateQuery<INotificationModel>,
    options?: QueryOptions
  ): Promise<INotificationModel | null> {
    return this.notificationRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<INotificationModel>, options?: QueryOptions): Promise<void> {
    return this.notificationRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.notificationRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.notificationRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<INotificationModel>, options?: QueryOptions): Promise<boolean> {
    return this.notificationRepository.exist(filter, options);
  }

}