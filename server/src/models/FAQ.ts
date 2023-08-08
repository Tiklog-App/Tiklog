import mongoose, { Document, Schema } from 'mongoose';

interface IFAQ {
    id_num: number,
    question: string,
    answer: string
};

const FAQSchema = new Schema<IFAQ>({
    id_num: { type: Number, required: true },
    question: { type: String },
    answer: { type: String }
});

// FAQSchema.pre('save', async function (next) {
//     if (this.isNew) {
//         try {
//             const sequence = await Sequence.findByIdAndUpdate(
//                 '_faq',
//                 { $inc: { seq: 1 } },
//                 { new: true, upsert: true }
//             );

//             this._id = sequence.seq;
//         } catch (error: any) {
//             return next(error);
//         }
//     }

//     next();
// });
  
export interface IFAQModel extends Document, IFAQ {}
  
const FAQ = mongoose.model<IFAQModel>('FAQ', FAQSchema);

export default FAQ;



