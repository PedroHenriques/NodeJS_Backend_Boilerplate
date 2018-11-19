'use strict';

export interface IFilesToWatch {
  [key: string]: {
    path: string,
    lastModified: number,
    persistKey: string,
  }
}

export interface IFileLoaderArgs {
  filesToWatch: IFilesToWatch,
}

export interface IFileTypeHandlers {
  [key: string]: (filePath: string) => Promise<any> | PromiseLike<any>,
}