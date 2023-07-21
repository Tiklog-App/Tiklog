import mongoose, { Document, Schema } from 'mongoose';

interface IAdminFee {
    adminFee: number,
    rider: mongoose.Types.ObjectId,
    deliveryRefNumber: string
};

const adminFeeSchema = new Schema<IAdminFee>({
    adminFee: { type: Number, default: 0 },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    deliveryRefNumber: { type: String }
});

adminFeeSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id firstName lastName gender email'
      });
    next();
});
  
export interface IAdminFeeModel extends Document, IAdminFee {}
  
const AdminFee = mongoose.model<IAdminFeeModel>('AdminFee', adminFeeSchema);

export default AdminFee