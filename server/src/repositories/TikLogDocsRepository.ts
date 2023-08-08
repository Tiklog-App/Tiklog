import CrudRepository from '../helpers/CrudRepository';
import { Model, Types } from 'mongoose';
import TikLogDocs, { ITikLogDocsModel } from '../models/TikLogDocs';

export default class TikLogDocsRepository extends CrudRepository<ITikLogDocsModel, Types.ObjectId> {
  constructor() {
    super(TikLogDocs as Model<ITikLogDocsModel>);
  }
}