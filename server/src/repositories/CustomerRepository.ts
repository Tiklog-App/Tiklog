import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Customer, { ICustomerModel } from '../models/Customer';

export default class CustomerRepository extends CrudRepository<ICustomerModel, Types.ObjectId> {
  constructor() {
    super(Customer as Model<ICustomerModel>);
  }
}