import { TOptions, TQueryResult } from '@/modules/paginate';
import { TDocumentId } from '@/modules/validate';
import { Document, FilterQuery, Model, Types } from 'mongoose';
import { z } from 'zod';
import { employeeSchema, updateEmployeeSchema } from './employee.validation';

export type TEmployee = {
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
};

export type TEmployeeDoc = TEmployee & Document;

export type TEmployeeModel = Model<TEmployeeDoc> & {
  paginate(filter: FilterQuery<TEmployeeDoc>, options: TOptions): Promise<TQueryResult<TEmployeeDoc>>;
  isEmailTaken(email: string, excludeUserId?: TDocumentId): Promise<boolean>;
};

export type TEmployeeSchema = z.infer<typeof employeeSchema>;
export type TUpdateEmployeeSchema = z.infer<typeof updateEmployeeSchema>;

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on-leave',
  TERMINATED = 'terminated',
  RETIRED = 'retired',
}
