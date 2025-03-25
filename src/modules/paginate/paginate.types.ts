import { Document, Model } from 'mongoose';

export type TQueryResult<T> = {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
};

export type TOptions = {
  sortBy?: string;
  projectBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
};

export type TProject = {
  name: string;
  milestones: number;
};

export type TTask = {
  name: string;
  project: string;
};

export type TProjectDoc = TProject & Document;
export type TTaskDoc = TTask & Document;

export type TProjectModel = Model<TProjectDoc> & {
  paginate(filter: Record<string, any>, options: TOptions): Promise<TQueryResult<TProjectDoc>>;
};
export type TTaskModel = Model<TTaskDoc> & {
  paginate(filter: Record<string, any>, options: TOptions): Promise<TQueryResult<TProjectDoc>>;
};
