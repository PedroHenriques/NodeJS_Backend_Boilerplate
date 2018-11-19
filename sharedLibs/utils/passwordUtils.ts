'use strict';
import { hash, compare } from 'bcryptjs';

export const createHash = (source: string): Promise<string> => hash(source, 10);

export const matchHash = (
  rawData: string, hashedData: string
): Promise<boolean> => compare(rawData, hashedData);