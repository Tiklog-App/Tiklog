import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Bank, { IBankModel } from '../models/Bank';

export default class BankRepository extends CrudRepository<IBankModel, Types.ObjectId> {
  constructor() {
    super(Bank as Model<IBankModel>);
  }
}