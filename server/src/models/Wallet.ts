import mongoose, { Document, Schema } from 'mongoose';

interface IWallet {
    balance: number,
    customer: mongoose.Types.ObjectId,
    transactions: mongoose.Types.ObjectId[]
};

const walletSchema = new Schema<IWallet>({
    balance: { type: Number, default: 0 },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
});

walletSchema.pre('find', function (next) {
    this.populate('transactions');
    next();
});
  
export interface IWalletModel extends Document, IWallet {}
  
const Wallet = mongoose.model<IWalletModel>('Wallet', walletSchema);

export default Wallet