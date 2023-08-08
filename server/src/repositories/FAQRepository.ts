import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import FAQ, { IFAQModel } from '../models/FAQ';

export default class FAQRepository extends CrudRepository<IFAQModel, Types.ObjectId> {
  constructor() {
    super(FAQ as Model<IFAQModel>);
  }
}