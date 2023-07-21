import mongoose, { Document, Schema } from 'mongoose';

interface IRiderWallet {
    balance: number,
    rider: mongoose.Types.ObjectId,
};

const riderWalletSchema = new Schema<IRiderWallet>({
    balance: { type: Number, default: 0 },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
});

riderWalletSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});
  
export interface IRiderWalletModel extends Document, IRiderWallet {}
  
const RiderWallet = mongoose.model<IRiderWalletModel>('RiderWallet', riderWalletSchema);

export default RiderWallet