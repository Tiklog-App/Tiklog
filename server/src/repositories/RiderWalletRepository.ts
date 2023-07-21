import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import RiderWallet, { IRiderWalletModel } from '../models/RiderWallet';

export default class RiderWalletRepository extends CrudRepository<IRiderWalletModel, Types.ObjectId> {
  constructor() {
    super(RiderWallet as Model<IRiderWalletModel>);
  }
}