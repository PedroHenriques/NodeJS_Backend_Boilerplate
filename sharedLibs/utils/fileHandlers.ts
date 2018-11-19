'use strict';
import { readFile as fsReadFile, stat, Stats } from 'fs';
import { promisify } from 'util';

const fsReadFilePromise = promisify(fsReadFile);
const fsStatPromise = promisify(stat);

export function getFileStats(filePath: string): Promise<Stats> {
  return(fsStatPromise(filePath));
}

export function readFile(filePath: string): Promise<string> {
  return(fsReadFilePromise(filePath, { encoding: 'utf-8', flag: 'r' }));
}

export function parseJsonFile(filePath: string): Promise<any> {
  return(
    readFile(filePath)
    .then(rawData => JSON.parse(rawData))
  );
}