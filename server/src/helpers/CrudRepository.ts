import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';
import { appModelTypes } from '../@types/app-model';
import AbstractCrudRepository = appModelTypes.AbstractCrudRepository;

export default class CrudRepository<M extends Document, Id extends Types.ObjectId> implements AbstractCrudRepository<M, Id> {
  private model: Model<M & Document>;

  constructor(model: Model<M>) {
    this.model = model;
  }

  async bulkCreate(records: ReadonlyArray<M>): Promise<Array<M>> {
    return this.model.insertMany(records);
  }

  async save(values: M, options?: QueryOptions): Promise<M> {
    const result = await this.model.create([values], options);
    return result[0];
  }

  async findAll(filter?: FilterQuery<M>, options?: QueryOptions, search?: string): Promise<Array<M>> {
    let query = filter ? this.model.find(filter, options) : this.model.find({}, options);
    
    //filtering/searching
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.find({ $or: [
        { active: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { senderName: searchRegex },
        { recipientName: searchRegex },
        { status: searchRegex }
      ] });
    };

    //check is sort
    if (options && options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ createdAt: -1 });
    }

    return query.exec();
  }

  async findById(id: Id, options?: QueryOptions): Promise<M | null> {
    return this.model.findById(id as any, null, options).exec();
  }

  async findByIdPopulatePermissions(id: Id, options?: QueryOptions): Promise<M | null> {
    return this.model.findById(id as any, null, options).populate({ path: 'permissions', options: { strictPopulate: false } }).exec() as Promise<M | null>;
  }  

  async findOne(filter: FilterQuery<M>, options?: QueryOptions): Promise<M | null> {
    return this.model.findOne(filter, null, options).exec();
  }

  async update(update: UpdateQuery<M>, options?: QueryOptions): Promise<M | null> {
    return this.model.updateOne(update, { new: true, ...options }).exec() as unknown as Promise<M | null>;
  }

  async updateByAny(filter: FilterQuery<M>, update: UpdateQuery<M>, options?: QueryOptions): Promise<M | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true, ...options }).exec();
  }

  async deleteByAny(filter: FilterQuery<M>, options?: QueryOptions): Promise<void> {
    await this.model.deleteOne(filter, options);
  }

  async deleteAll(options?: QueryOptions): Promise<void> {
    await this.model.deleteMany({}, options);
  }

  async deleteById(id: Id, options?: QueryOptions): Promise<void> {
    await this.model.findByIdAndDelete(id as any, options);
  }

  async exist(filter: FilterQuery<M>, options?: QueryOptions): Promise<boolean> {
    const count = await this.model.countDocuments(filter, options).exec();
    return count > 0;
  }
  
}
