import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import {IVehicleTypeModel} from '../../models/VehicleType';
import VehicleTypeRepository from '../../repositories/VehicleTypeRepository';

import { appModelTypes } from '../../@types/app-model';
import ICrudDAO = appModelTypes.ICrudDAO;

export default class CustomerLocationDAOService implements ICrudDAO<IVehicleTypeModel> {
  private vehicleTypeRepository: VehicleTypeRepository;

  constructor(vehicleTypeRepository: VehicleTypeRepository) {
    this.vehicleTypeRepository = vehicleTypeRepository
  }

  //@ts-ignore
  insertMany(records: ReadonlyArray<IVehicleTypeModel>): Promise<IVehicleTypeModel[]> {
    return this.vehicleTypeRepository.bulkCreate(records)
  }

  create(values: IVehicleTypeModel): Promise<IVehicleTypeModel> {
    return this.vehicleTypeRepository.save(values);
  }

  findAll(filter?: FilterQuery<IVehicleTypeModel>, options?: QueryOptions): Promise<IVehicleTypeModel[]> {
    return this.vehicleTypeRepository.findAll(filter, options);
  }

  findById(id: any, options?: QueryOptions): Promise<IVehicleTypeModel | null> {
    return this.vehicleTypeRepository.findById(id, options);
  }

  findByAny(filter: FilterQuery<IVehicleTypeModel>, options?: QueryOptions): Promise<IVehicleTypeModel | null> {
    return this.vehicleTypeRepository.findOne(filter, options);
  }

  update(update: UpdateQuery<IVehicleTypeModel>, options: QueryOptions): Promise<IVehicleTypeModel | null> {
    return this.vehicleTypeRepository.update(update, { new: true, ...options });
  }

  updateByAny(
    filter: FilterQuery<IVehicleTypeModel>,
    update: UpdateQuery<IVehicleTypeModel>,
    options?: QueryOptions
  ): Promise<IVehicleTypeModel | null> {
    return this.vehicleTypeRepository.updateByAny(filter, update, options)
  }

  deleteByAny(filter: FilterQuery<IVehicleTypeModel>, options?: QueryOptions): Promise<void> {
    return this.vehicleTypeRepository.deleteByAny(filter, options);
  }

  deleteAll(options?: QueryOptions): Promise<void> {
    return this.vehicleTypeRepository.deleteAll(options);
  }

  deleteById(id: any, options?: QueryOptions): Promise<void> {
    return this.vehicleTypeRepository.deleteById(id, options);
  }

  exist(filter: FilterQuery<IVehicleTypeModel>, options?: QueryOptions): Promise<boolean> {
    return this.vehicleTypeRepository.exist(filter, options);
  }

}
