import mongoose, { Document, Schema } from 'mongoose';

interface IPermission {
  name: string;
  action: string;
  subject: string;
  inverted: boolean;
  roles?: mongoose.Types.ObjectId[];
}

const permissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
  action: { type: String },
  subject: { type: String },
  inverted: { type: Boolean },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
});

export interface IPermissionModel extends IPermission, Document{}

const Permission = mongoose.model<IPermissionModel>('Permission', permissionSchema);

export default Permission;