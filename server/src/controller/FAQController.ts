import { Request } from 'express';
import { HasPermission, TryCatch } from '../decorators';
import HttpStatus from '../helpers/HttpStatus';
import CustomAPIError from '../exceptions/CustomAPIError';
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';

import HttpResponse = appCommonTypes.HttpResponse;
import { 
  CREATE_FAQ, 
  DELETE_FAQ,
  MANAGE_ALL, 
  UPDATE_FAQ
} from '../config/settings';

export default class FAQController {
  @TryCatch
  @HasPermission([MANAGE_ALL, CREATE_FAQ])
  public async createFAQ(req: Request) {

    const role = await this.doCreateFAQ(req);
  
    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: role,
    };
  
    return Promise.resolve(response);
  };

  @TryCatch
  @HasPermission([MANAGE_ALL, DELETE_FAQ])
  public async deleteFAQ(req: Request) {

    const faqId = req.params.faqId;

    const faq = await datasources.faqDAOService.findById(faqId);
    if(!faq)
      Promise.reject(CustomAPIError.response('FAQ does not exist', HttpStatus.NOT_FOUND.code));

    await datasources.faqDAOService.deleteById(faqId);

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'FAQ deleted successfully'
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  public async getSingleFAQ(req: Request) {

    const faqId = req.params.faqId
    
    const faq = await datasources.faqDAOService.findById(faqId);
    if(!faq)
     return Promise.reject(CustomAPIError.response('Not found', HttpStatus.NOT_FOUND.code));

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: faq
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  public async fetchFAQ(req: Request) {

    const FAQ = await datasources.faqDAOService.findAll({})

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: "Successful.",
      results: FAQ
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  @HasPermission([MANAGE_ALL, UPDATE_FAQ])
  public async updateFAQ(req: Request) {
    const faqId = req.params.faqId;

    const { answer, question } = req.body;

    const faq = await datasources.faqDAOService.findById(faqId);
    if(!faq)
      return Promise.reject(CustomAPIError.response('FAQ not found', HttpStatus.NOT_FOUND.code));

    const updValues = {
      answer,
      question
    }

    await datasources.faqDAOService.update({_id: faqId}, updValues)

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'FAQ update successfully'
    };
  
    return Promise.resolve(response);
  }
  

  private async doCreateFAQ(req: Request) {

    const values = req.body;

    const fetchFaq = await datasources.faqDAOService.findAll({});

    const faqValues = {
      ...values,
      id_num: fetchFaq?.length + 1
    };

    const faq = await datasources.faqDAOService.create(faqValues);

    return faq
  }

}