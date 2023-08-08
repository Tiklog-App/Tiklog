import mongoose, { Document, Schema } from 'mongoose';

interface ITikLogDocs {
    terms_and_condition: string | null,
    returnPolicy: string | null,
    largeDelivery: string | null,
    transportation: string | null
};

const tiklogDocSchema = new Schema<ITikLogDocs>({
    terms_and_condition: { type: String, allowNull: true },
    returnPolicy: { type: String, allowNull: true },
    largeDelivery: { type: String, allowNull: true },
    transportation: { type: String, allowNull: true }
});
  
export interface ITikLogDocsModel extends Document, ITikLogDocs {}
  
const TiklogDocs = mongoose.model<ITikLogDocsModel>('TiklogDocs', tiklogDocSchema);

export default TiklogDocs