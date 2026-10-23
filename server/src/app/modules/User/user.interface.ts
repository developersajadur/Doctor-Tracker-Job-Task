import { Model } from 'mongoose';
import { TUserRole } from './user.constant';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: TUserRole;
  isBlocked?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser | null>;
}
