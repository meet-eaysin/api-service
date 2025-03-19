import { Document, FilterQuery, Model, Types } from 'mongoose';
import { IOptions, QueryResult } from '../paginate/paginate';
import { DocumentId } from '../validate/id';

export interface IEmployee {
  user: Types.ObjectId;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: Date;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  date_of_hire: Date;
  job_title: string;
  department: Types.ObjectId;
  manager?: Types.ObjectId;
  position: Types.ObjectId;
  salary: {
    base: number;
    currency: string;
    payment_frequency: string;
  };
  employment_status: string;
  skills: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications: Array<{
    name: string;
    issuing_organization: string;
    issue_date: Date;
    expiration_date?: Date;
  }>;
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  isActive: boolean;
}

export type IEmployeeDoc = IEmployee & Document;

export interface IEmployeeModel extends Model<IEmployeeDoc> {
  paginate(filter: FilterQuery<IEmployeeDoc>, options: IOptions): Promise<QueryResult>;
  isEmailTaken(email: string, excludeUserId?: DocumentId): Promise<boolean>;
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on-leave',
  TERMINATED = 'terminated',
  RETIRED = 'retired',
}
