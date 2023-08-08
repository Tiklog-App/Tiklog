import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IFAQModel} from '../../models/FAQ';
import FAQRepository from '../../repositories/FAQRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class FAQDAOService implements ICrudDAO<IFAQModel> {
  private faqRepository: FAQRepository;

  constructor(faqRepository: FAQRepository) {
    this.faqRepository = faqRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IFAQModel>): Promise<IFAQModel[]> {
    return this.faqRepository.bulkCreate(records)
  }

  create(values: IFAQModel): Promise<IFAQModel> {
    return this.faqRepository.save(values);
  }

  findAll(filter?: FilterQuery<IFAQModel>, options?: QueryOptions): Promise<IFAQModel[]> {
    return this.faqRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IFAQModel | null> {
    return this.faqRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IFAQModel>, options?: QueryOptions): Promise<IFAQModel | null> {
    return this.faqRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IFAQModel>, options: QueryOptions): Promise<IFAQModel | null> {
    return this.faqRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IFAQModel>,
    update: UpdateQuery<IFAQModel>,
    options?: QueryOptions
  ): Promise<IFAQModel | null> {
    return this.faqRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IFAQModel>, options?: QueryOptions): Promise<void> {
    return this.faqRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.faqRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.faqRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IFAQModel>, options?: QueryOptions): Promise<boolean> {
    return this.faqRepository.exist(filter, options);
  }

}
