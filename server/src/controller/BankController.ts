import { Request } from 'express';
import { TryCatch } from '../decorators';
import { appCommonTypes } from '../@types/app-common';
import HttpResponse = appCommonTypes.HttpResponse;
import HttpStatus from '../helpers/HttpStatus';
import datasources from '../services/dao';

export default class BankController {

  @TryCatch
  public async getBanks(req: Request) {

    const banks = await datasources.bankDAOService.findAll({});

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'Banks retrieved successfully.',
      results: banks,
    };

    return Promise.resolve(response);
  }
}
