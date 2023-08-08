import { Request } from 'express';
import { HasPermission, TryCatch } from '../decorators';
import HttpStatus from '../helpers/HttpStatus';
import CustomAPIError from '../exceptions/CustomAPIError';
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import HttpResponse = appCommonTypes.HttpResponse;
import { ITikLogDocsModel } from '../models/TikLogDocs';
import { CREATE_DOC, MANAGE_ALL, UPDATE_DOC } from '../config/settings';

export default class TikLogDocsController {
  @TryCatch
  @HasPermission([MANAGE_ALL, CREATE_DOC])
  public async createDocs(req: Request) {

    const docs = await this.doCreateTikLogDocs(req);
  
    const response: HttpResponse<ITikLogDocsModel> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: docs,
    };
  
    return Promise.resolve(response);
  };

  @TryCatch
  public async getDocs(req: Request) {
  
    const docs = await datasources.tikLogDocsDAOService.findAll({});

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      results: docs
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  @HasPermission([MANAGE_ALL, UPDATE_DOC])
  public async updateDocs(req: Request) {
    const docId = req.params.docId;

    const findDoc = await datasources.tikLogDocsDAOService.findById(docId);
    if(!findDoc)
      return Promise.reject(CustomAPIError.response('Docs not found', HttpStatus.NOT_FOUND.code));
    
    await datasources.tikLogDocsDAOService.update({_id: docId}, {...req.body})

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'Updated successfully'
    };
  
    return Promise.resolve(response);
  }
  

  private async doCreateTikLogDocs(req: Request) {

    const values = req.body;

    const docs = await datasources.tikLogDocsDAOService.findAll({});
    if(docs.length)
      return Promise.reject(CustomAPIError.response('Only one record is allowed', HttpStatus.BAD_REQUEST.code));

    const newDocs = await datasources.tikLogDocsDAOService.create({...values} as ITikLogDocsModel);

    return newDocs;
  }

}