import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import PaymentRequest, { IPaymentRequestModel } from '../models/PaymentRequest';

export default class PaymentRequestRepository extends CrudRepository<IPaymentRequestModel, Types.ObjectId> {
  constructor() {
    super(PaymentRequest as Model<IPaymentRequestModel>);
  }
}