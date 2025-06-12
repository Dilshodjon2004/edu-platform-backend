import { UserDocument } from './user.model';

export type RoleUser = 'ADMIN' | 'USER' | 'INSTRUCTOR';
export type UserTypeData = keyof UserDocument;

export interface IEmailAndPassword {
  email: string;
  password: string;
}
