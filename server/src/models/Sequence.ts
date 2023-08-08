import mongoose, { Schema } from 'mongoose';

interface ISequence {
    _id: string;
    seq: number;
}

const SequenceSchema = new Schema<ISequence>({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

const Sequence = mongoose.model<ISequence>('Sequence', SequenceSchema);

export default Sequence;
