import mongoose, { Document, Schema } from 'mongoose';

interface ITransactions {
    reference: string,
    amount: number,
    status: string,
    type: string,
    serviceStatus: string | null,
    authorizationUrl: string | null,
    last4: string | null,
    expMonth: string | null,
    expYear: string | null,
    channel: string | null,
    cardType: string | null,
    bank: string | null,
    countryCode: string,
    brand: string | null,
    currency: string,
    paidAt: Date,
    customer: mongoose.Types.ObjectId;
};

const transactionSchema = new Schema<ITransactions>({
    reference: { type: String },
    amount: { type: Number },
    status: { type: String },
    type: { type: String },
    serviceStatus: { type: String, allowNull: true },
    authorizationUrl: { type: String, allowNull: true },
    last4: { type: String, allowNull: true },
    expMonth: { type: String, allowNull: true },
    expYear: { type: String, allowNull: true },
    channel: { type: String, allowNull: true },
    cardType: { type: String, allowNull: true },
    bank: { type: String, allowNull: true },
    countryCode: { type: String },
    brand: { type: String, allowNull: true },
    currency: { type: String },
    paidAt: { type: Date },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' }
});

transactionSchema.pre('findOne', function (next) {
    this.populate('customer');
    next();
});
  
export interface ITransactionModel extends Document, ITransactions {}
  
const Transaction = mongoose.model<ITransactionModel>('Transaction', transactionSchema);

export default Transaction