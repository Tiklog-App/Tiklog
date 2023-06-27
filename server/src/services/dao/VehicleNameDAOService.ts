import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IVehicleNameModel} from '../../models/VehicleName';
import VehicleNameRepository from '../../repositories/VehicleNameRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerLocationDAOService implements ICrudDAO<IVehicleNameModel> {
  private vehicleNameRepository: VehicleNameRepository;

  constructor(vehicleNameRepository: VehicleNameRepository) {
    this.vehicleNameRepository = vehicleNameRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IVehicleNameModel>): Promise<IVehicleNameModel[]> {
    return this.vehicleNameRepository.bulkCreate(records)
  }

  create(values: IVehicleNameModel): Promise<IVehicleNameModel> {
    return this.vehicleNameRepository.save(values);
  }

  findAll(filter?: FilterQuery<IVehicleNameModel>, options?: QueryOptions): Promise<IVehicleNameModel[]> {
    return this.vehicleNameRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IVehicleNameModel | null> {
    return this.vehicleNameRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IVehicleNameModel>, options?: QueryOptions): Promise<IVehicleNameModel | null> {
    return this.vehicleNameRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IVehicleNameModel>, options: QueryOptions): Promise<IVehicleNameModel | null> {
    return this.vehicleNameRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IVehicleNameModel>,
    update: UpdateQuery<IVehicleNameModel>,
    options?: QueryOptions
  ): Promise<IVehicleNameModel | null> {
    return this.vehicleNameRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IVehicleNameModel>, options?: QueryOptions): Promise<void> {
    return this.vehicleNameRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.vehicleNameRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.vehicleNameRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IVehicleNameModel>, options?: QueryOptions): Promise<boolean> {
    return this.vehicleNameRepository.exist(filter, options);
  }

}
