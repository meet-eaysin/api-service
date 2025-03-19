import httpStatus from 'http-status';
import { PopulateOptions } from 'mongoose';
import ApiError from '../errors/ApiError';

export type PopulateInput = string | string[] | undefined;
export type PopulateOutput = PopulateOptions | (string | PopulateOptions)[] | undefined;

/**
 * Validates and transforms the `populate` input into the expected type.
 *
 * @param populate - The input populate value (string, array, or undefined).
 * @returns The transformed populate value or undefined if invalid.
 * @throws ApplicationError if the populate value is invalid.
 */
export const parsePopulate = (populate: PopulateInput): PopulateOutput => {
  if (typeof populate === 'string') {
    return populate.split(',').map((item) => item.trim());
  }

  if (Array.isArray(populate)) {
    return populate.filter((item): item is string => typeof item === 'string').map((item) => item.trim());
  }

  if (populate && typeof populate !== 'string' && !Array.isArray(populate)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid populate value');
  }

  return undefined;
};
