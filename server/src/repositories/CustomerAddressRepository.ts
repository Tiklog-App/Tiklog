import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import CustomerAddress, { ICustomerAddressModel } from '../models/CustomerAddress';

export default class CustomerAddressRepository extends CrudRepository<ICustomerAddressModel, Types.ObjectId> {
  constructor() {
    super(CustomerAddress as Model<ICustomerAddressModel>);
  }
}