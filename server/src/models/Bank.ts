import mongoose, { Document, Schema } from 'mongoose';

interface IBank {
    name: string,
    slug: string,
    code: string,
    longCode: string,
    gateway: string,
    payWithBank: boolean,
    active: boolean,
    isDeleted:boolean,
    country: string,
    currency: string,
    type: string,

};

const bank = new Schema<IBank>({
    name: { type: String },
    slug: { type: String },
    code: { type: String },
    longCode: { type: String },
    gateway: { type: String },
    payWithBank: { type: Boolean },
    active: { type: Boolean },
    isDeleted: { type: Boolean },
    country: { type: String },
    currency: { type: String },
    type: { type: String },
});
  
export interface IBankModel extends Document, IBank {}
  
const Bank = mongoose.model<IBankModel>('Bank', bank);

export default Bank