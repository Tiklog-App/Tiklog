import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Delivery, { IDeliveryModel } from '../models/Delivery';

export default class DeliveryRepository extends CrudRepository<IDeliveryModel, Types.ObjectId> {
  constructor() {
    super(Delivery as Model<IDeliveryModel>);
  }
}