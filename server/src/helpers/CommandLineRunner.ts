/**
 * This helper Class, executes commands in form of methods,we want to run at runtime.
 */
import fs from 'fs/promises';
import RoleRepository from '../repositories/RoleRepository';
import PermissionRepository from '../repositories/PermissionRepository';
import { appModelTypes } from '../@types/app-model';
import adminJson from '../resources/data/superAdmin.json';
import UserRepository from '../repositories/UserRepository';
import PasswordEncoder from '../utils/PasswordEncoder';
import axiosClient from '../services/api/axiosClient';
import Role from '../models/Role';
import Permission from '../models/Permission';
import Bank from '../models/Bank';
import BankRepository from '../repositories/BankRepository';
import AbstractCrudRepository = appModelTypes.AbstractCrudRepository;
import IPayStackBank = appModelTypes.IPayStackBank;
import settings, { MANAGE_ALL, MANAGE_SOME } from '../config/settings';
import { IUserModel } from '../models/User';
import Generic from '../utils/Generic';
import { UPLOAD_BASE_PATH } from '../config/constants';
import VehicleTypeRepository from '../repositories/VehicleTypeRepository';
import vehicleTypes from '../resources/data/vehicleType.json';

export default class CommandLineRunner {
  public static singleton: CommandLineRunner = new CommandLineRunner();
  private roleRepository: AbstractCrudRepository;
  private permissionRepository: AbstractCrudRepository;
  private userRepository: AbstractCrudRepository;
  private bankRepository: BankRepository;
  private vehicleTypeRepository: VehicleTypeRepository;

  constructor() {
    this.bankRepository = new BankRepository();
    this.roleRepository = new RoleRepository();
    this.permissionRepository = new PermissionRepository();
    this.userRepository = new UserRepository();
    this.vehicleTypeRepository = new VehicleTypeRepository();
  }

  public static async run() {
    await this.singleton.loadDefaultRolesAndPermissions();
    await this.singleton.loadDefaultSuperAdmin();
    await this.singleton.loadPayStackBanks();
    await this.singleton.loadVehicleTypes();
    // await this.singleton.syncRolesAndPermission()
  }

  async createUploadDirectory() {
    const dirExist = await Generic.fileExist(UPLOAD_BASE_PATH);
    if (!dirExist) await fs.mkdir(UPLOAD_BASE_PATH);
  }

  async loadPayStackBanks() {
    await Bank.collection.drop();

    axiosClient.defaults.baseURL = `${process.env.PAYMENT_GW_BASE_URL}`;
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.PAYMENT_GW_SECRET_KEY}`;

    const response = await axiosClient.get('/bank');

    const banks = response.data.data as IPayStackBank[];

    const bankValues = banks.map(bank => ({
      name: bank.name,
      slug: bank.slug,
      code: bank.code,
      longCode: bank.longcode,
      gateway: bank.gateway,
      payWithBank: bank.pay_with_bank,
      active: bank.active,
      country: bank.country,
      currency: bank.currency,
      type: bank.type,
      isDeleted: bank.is_deleted,
    }));

    await this.bankRepository.bulkCreate(bankValues as any);
  }

  async loadDefaultSuperAdmin() {
    const exist = await this.userRepository.findOne({
      slug: settings.roles[0]
    });

    if (exist) return;

    const passwordEncoder = new PasswordEncoder();

    Object.assign(adminJson, {
      password: await passwordEncoder.encode(<string>process.env.ADMIN_PASS),
      confirm_password: await passwordEncoder.encode(<string>process.env.ADMIN_PASS)
    });

    const user = (await this.userRepository.save(adminJson as any)) as IUserModel;

    const role = await this.roleRepository.findOne({
      slug: settings.roles[0],
    });

    if (role) {
      user.roles = role?.id;
      await user.save();
      //@ts-ignore
      role.users.push(user._id);
      await role.save();
    }
  }

  // async syncRolesAndPermission() {
  //   const permissions = settings.permissions;
  //   for (let i = 0; i < permissions.length; i++) {
  //     const permissionName = permissions[i];
  //     const perm = await this.permissionRepository.findOne({
  //       name: permissionName
  //     });
  //     if (perm) continue;

  //     await this.permissionRepository.save({
  //       //@ts-ignore
  //       name: permissionName,
  //       action: permissionName.split('_')[0],
  //       subject: permissionName.split('_')[1],
  //       inverted: true,
  //     });
  //   }

  //   const roles = settings.roles;
  //   for (let i = 0; i < roles.length; i++) {
  //     const roleName = roles[i];
  //     const role = await this.roleRepository.findOne({
  //       where: {
  //         slug: roleName,
  //       },
  //     });
  //     if (role) continue;

  //     await this.roleRepository.save({
  //       //@ts-ignore
  //       slug: `${roleName}`,
  //       name: `${roleName}`.replace(/_/g, ' '),
  //     });
  //   }
  // }

  async loadDefaultRolesAndPermissions() {
    // const $roles = await this.roleRepository.findAll();
    // const $permissions = await this.permissionRepository.findAll();

    // if ($roles.length) await Role.collection.drop();
    // if ($permissions.length) await Permission.collection.drop();

    //create permissions
    for (const permissionName of settings.permissions) {
      const findPermission = await this.permissionRepository.findOne({
        name: permissionName
      });
      if(!findPermission) {
        await this.permissionRepository.save({
          //@ts-ignore
          name: permissionName,
          action: permissionName.split('_')[0],
          subject: permissionName.split('_')[1],
          inverted: true,
        });
      }
    }

    //create roles
    for (const roleName of settings.roles) {
      const findRole = await this.roleRepository.findOne({
        slug: roleName
      });

      if(!findRole) {
        await this.roleRepository.save({
          //@ts-ignore
          slug: `${roleName}`,
          name: `${roleName}`.replace(/_/g, ' '),
        });
      }
    }

    //customer permission
    const customerPermission = await this.permissionRepository.findAll({
      name: settings.permissions[2]
    });

    //rider permission
    const riderPermission = await this.permissionRepository.findAll({
      name: settings.permissions[3]
    });

    //super admin permissions
    const superAdminPermission = await this.permissionRepository.findAll({
      name: MANAGE_ALL
    });

    //admin permissions
    const adminPermission = await this.permissionRepository.findAll({
      name: MANAGE_SOME
    });

    //get customer role
    const customerRole = await this.roleRepository.findOne({
      slug: settings.roles[2]
    });

    //get super admin role
    const superAdminRole = await this.roleRepository.findOne({
      slug: settings.roles[0]
    });

    //get admin role
    const adminRole = await this.roleRepository.findOne({
      slug: settings.roles[1]
    });

    //get rider role
    const riderRole = await this.roleRepository.findOne({
      slug: settings.roles[3]
    });

    //associate roles to their respective permissions
    //@ts-ignore
    for(let perm of customerPermission){
      //@ts-ignore
      if(!customerRole?.permissions.includes(perm._id)){
        //@ts-ignore  
        customerRole?.permissions.push(perm._id);
        await customerRole?.save();
      }
    }
    //@ts-ignore  
    for(let perm of riderPermission){
      //@ts-ignore
      if(!riderRole?.permissions.includes(perm._id)){
        //@ts-ignore  
        riderRole?.permissions.push(perm._id);
        await riderRole?.save();
      }
    }
    for(let perm of superAdminPermission){
      //@ts-ignore
      if(!superAdminRole?.permissions.includes(perm._id)){
        //@ts-ignore  
        superAdminRole?.permissions.push(perm._id);
        await superAdminRole?.save();
      }
    }
    for(let perm of adminPermission){
      //@ts-ignore
      if(!adminRole?.permissions.includes(perm._id)){
        //@ts-ignore  
        adminRole?.permissions.push(perm._id);
        await adminRole?.save();
      }
    }
  }

  async loadVehicleTypes() {
    const fetchVehicleTypes = await this.vehicleTypeRepository.findAll({})
    //@ts-ignore
    const existingSlugs = fetchVehicleTypes.map(types => types.slug);

    for(let type of vehicleTypes){
      if(!existingSlugs.includes(type.slug)){
        
        await this.vehicleTypeRepository.save({
          vehicleType: type.vehicleType,
          slug: type.slug,
          speed: type.speed,
          costPerKm: type.costPerKm,
        } as any);
      }
    }
  }

}
