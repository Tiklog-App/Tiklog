import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {ITikLogDocsModel} from '../../models/TikLogDocs';
import TikLogDocsRepository from '../../repositories/TikLogDocsRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class TikLogDocsDAOService implements ICrudDAO<ITikLogDocsModel> {
  private tikLogDocsRepository: TikLogDocsRepository;

  constructor(tikLogDocsRepository: TikLogDocsRepository) {
    this.tikLogDocsRepository = tikLogDocsRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<ITikLogDocsModel>): Promise<ITikLogDocsModel[]> {
    return this.tikLogDocsRepository.bulkCreate(records)
  }

  create(values: ITikLogDocsModel): Promise<ITikLogDocsModel> {
    return this.tikLogDocsRepository.save(values);
  }

  findAll(filter?: FilterQuery<ITikLogDocsModel>, options?: QueryOptions): Promise<ITikLogDocsModel[]> {
    return this.tikLogDocsRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<ITikLogDocsModel | null> {
    return this.tikLogDocsRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<ITikLogDocsModel>, options?: QueryOptions): Promise<ITikLogDocsModel | null> {
    return this.tikLogDocsRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<ITikLogDocsModel>, options: QueryOptions): Promise<ITikLogDocsModel | null> {
    return this.tikLogDocsRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<ITikLogDocsModel>,
    update: UpdateQuery<ITikLogDocsModel>,
    options?: QueryOptions
  ): Promise<ITikLogDocsModel | null> {
    return this.tikLogDocsRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<ITikLogDocsModel>, options?: QueryOptions): Promise<void> {
    return this.tikLogDocsRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.tikLogDocsRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.tikLogDocsRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<ITikLogDocsModel>, options?: QueryOptions): Promise<boolean> {
    return this.tikLogDocsRepository.exist(filter, options);
  }

}
