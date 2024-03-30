import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import RiderTransactions, { IRiderTransactionsModel } from '../models/RiderTransactions';

export default class RiderTransactionsRepository extends CrudRepository<IRiderTransactionsModel, Types.ObjectId> {
  constructor() {
    super(RiderTransactions as Model<IRiderTransactionsModel>);
  }
}