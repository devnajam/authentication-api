import { ObjectId } from "mongodb";

export interface SignupBody {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  name: string;
  username: string;
  email: string;
  email_verified: boolean;
  createdAt: Date;
  passwordChangedAt: Date;
}

export interface IUser extends User {
  _id: ObjectId;
}
export interface PUser extends User {
  password: string;
}

export interface DBUser extends PUser {}
