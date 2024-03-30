import mongoose, { Document, Schema } from 'mongoose';

interface IRiderTransactions {
    amount: number,
    type: string,
    rider: mongoose.Types.ObjectId,
    customer: mongoose.Types.ObjectId | null,
};

const riderTransactionsSchema = new Schema<IRiderTransactions>({
    amount: { type: Number, default: 0 },
    type: { type: String },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', allowNull: true }
}, { timestamps: true });

riderTransactionsSchema.pre(['findOne', 'find'], function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});

riderTransactionsSchema.pre(['findOne', 'find'], function (next) {
    this.populate({
        path: 'customer',
        select: '_id firstName lastName gender email'
      });
    next();
});
  
export interface IRiderTransactionsModel extends Document, IRiderTransactions {}
  
const RiderTransactions = mongoose.model<IRiderTransactionsModel>('RiderTransactions', riderTransactionsSchema);

export default RiderTransactions