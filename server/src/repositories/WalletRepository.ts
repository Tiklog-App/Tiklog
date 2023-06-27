import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import Wallet, { IWalletModel } from '../models/Wallet';

export default class WalletRepository extends CrudRepository<IWalletModel, Types.ObjectId> {
  constructor() {
    super(Wallet as Model<IWalletModel>);
  }
}