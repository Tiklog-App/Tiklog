import mongoose, { Document, Schema } from 'mongoose';

interface IRiderLocation {
    location: {
        type: "Point",
        coordinates: [number, number]
    },
    rider: mongoose.Types.ObjectId;
};

const riderLocationSchema = new Schema<IRiderLocation>({
    location: {
        type: {
            type: String,
            enum: ['Point'], // Only allow 'Point' as the type
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' }
});

riderLocationSchema.pre('findOne', function (next) {
    this.populate('rider');
    next();
});

riderLocationSchema.index({ location: '2dsphere' });

export interface IRiderLocationModel extends Document, IRiderLocation {}

const RiderLocation = mongoose.model<IRiderLocationModel>('RiderLocation', riderLocationSchema);

export default RiderLocation;