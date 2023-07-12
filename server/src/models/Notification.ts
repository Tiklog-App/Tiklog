import mongoose, { Document, Schema } from 'mongoose';

interface INotification {
    deliveryRefNumber: string,
    riderAvailabilityStatus: boolean,
    rider: mongoose.Types.ObjectId,
    customer: mongoose.Types.ObjectId
};

const notificationSchema = new Schema<INotification>({
    deliveryRefNumber: { type: String },
    riderAvailabilityStatus: { type: Boolean },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' }
});

notificationSchema.pre('findOne', function (next) {
    this.populate('customer');
    next();
});

notificationSchema.pre('findOne', function (next) {
    this.populate('rider');
    next();
});
  
export interface INotificationModel extends Document, INotification {}
  
const Notification = mongoose.model<INotificationModel>('Notification', notificationSchema);

export default Notification