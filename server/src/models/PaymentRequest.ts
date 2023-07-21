import mongoose, { Document, Schema } from 'mongoose';

interface IPaymentRequest {
    amountRequested: number,
    rider: mongoose.Types.ObjectId,
    status: string,
    refNumber: string,
    createdAt: Date
};

const paymentRequestSchema = new Schema<IPaymentRequest>({
    amountRequested: { type: Number, default: 0 },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    status: { type: String },
    refNumber: { type: String },
    createdAt: { type: Date, default: Date.now }
});

paymentRequestSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});
  
export interface IPaymentRequestModel extends Document, IPaymentRequest {}
  
const PaymentRequest = mongoose.model<IPaymentRequestModel>('PaymentRequest', paymentRequestSchema);

export default PaymentRequest