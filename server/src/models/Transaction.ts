import mongoose, { Document, Schema } from 'mongoose';

interface ITransactions {
    reference: string,
    amount: number,
    status: string,
    type: string,
    serviceStatus: string,
    authorizationUrl: string,
    last4: string,
    expMonth: string,
    expYear: string,
    channel: string,
    cardType: string,
    bank: string,
    countryCode: string,
    brand: string,
    currency: string,
    paidAt: Date,
    customer: mongoose.Types.ObjectId;
};

const transactionSchema = new Schema<ITransactions>({
    reference: { type: String },
    amount: { type: Number },
    status: { type: String },
    type: { type: String },
    serviceStatus: { type: String },
    authorizationUrl: { type: String },
    last4: { type: String },
    expMonth: { type: String },
    expYear: { type: String },
    channel: { type: String },
    cardType: { type: String },
    bank: { type: String },
    countryCode: { type: String },
    brand: { type: String },
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