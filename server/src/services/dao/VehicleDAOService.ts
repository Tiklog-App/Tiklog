import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IVehicleModel} from '../../models/Vehicle';
import VehicleRepository from '../../repositories/VehicleRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerLocationDAOService implements ICrudDAO<IVehicleModel> {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    this.vehicleRepository = vehicleRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IVehicleModel>): Promise<IVehicleModel[]> {
    return this.vehicleRepository.bulkCreate(records)
  }

  create(values: IVehicleModel): Promise<IVehicleModel> {
    return this.vehicleRepository.save(values);
  }

  findAll(filter?: FilterQuery<IVehicleModel>, options?: QueryOptions): Promise<IVehicleModel[]> {
    return this.vehicleRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IVehicleModel | null> {
    return this.vehicleRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IVehicleModel>, options?: QueryOptions): Promise<IVehicleModel | null> {
    return this.vehicleRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IVehicleModel>, options: QueryOptions): Promise<IVehicleModel | null> {
    return this.vehicleRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IVehicleModel>,
    update: UpdateQuery<IVehicleModel>,
    options?: QueryOptions
  ): Promise<IVehicleModel | null> {
    return this.vehicleRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IVehicleModel>, options?: QueryOptions): Promise<void> {
    return this.vehicleRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.vehicleRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.vehicleRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IVehicleModel>, options?: QueryOptions): Promise<boolean> {
    return this.vehicleRepository.exist(filter, options);
  }

}
