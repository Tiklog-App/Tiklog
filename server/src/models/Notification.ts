import mongoose, { Document, Schema } from 'mongoose';

interface INotification {
    deliveryRefNumber: string,
    riderAvailabilityStatus: boolean,
    rider: mongoose.Types.ObjectId,
    customer: mongoose.Types.ObjectId,
    delivery: mongoose.Types.ObjectId
};

const notificationSchema = new Schema<INotification>({
    deliveryRefNumber: { type: String },
    riderAvailabilityStatus: { type: Boolean },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery' }
});

notificationSchema.pre('findOne', function (next) {
    this.populate({
        path: 'customer',
        select: '_id phone dob email firstName gender lastName other_names createdAt'
    });
    next();
});

notificationSchema.pre('findOne', function (next) {
    this.populate({
        path: 'rider',
        select: '_id phone status busy dob email gender profileImageUrl firstName lastName other_names accountName accountNumber bankName createdAt'
    });
    next();
});

notificationSchema.pre('findOne', function (next) {
    this.populate('delivery');
    next();
});
  
export interface INotificationModel extends Document, INotification {}
  
const Notification = mongoose.model<INotificationModel>('Notification', notificationSchema);

export default Notification