import { Model, Types } from 'mongoose';
import Notification, { INotificationModel } from '../models/Notification';
import CrudRepository from '../helpers/CrudRepository';

export default class NotificationRepository extends CrudRepository<INotificationModel, Types.ObjectId> {
  constructor() {
    super(Notification as Model<INotificationModel>);
  }
}
