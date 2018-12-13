'use strict';
import {
  getFileStats, parseJsonFile
} from '../../sharedLibs/utils/fileHandlers';
import * as logger from '../../sharedLibs/services/logger';
import {
  mqCacheStoreObject
} from '../../sharedLibs/utils/cacheEventDispatchers';
import { channel } from '../../sharedLibs/utils/queue';
import {
  IFilesToWatch, IFileLoaderArgs, IFileTypeHandlers
} from '../interfaces/services';

const fileTypeHandlers: IFileTypeHandlers = {
  json: parseJsonFile,
};

export default function configLoader(args: IFileLoaderArgs) {
  const filesToWatch: IFilesToWatch = args.filesToWatch;
  let intervalId: NodeJS.Timer | null = null;

  const regularFileCheckup = (): void => {
    logger.debug({ message: 'Starting file checkup' });

    Object.getOwnPropertyNames(filesToWatch).forEach(async key => {
      try {
        if (channel === undefined) {
          throw new Error(
            'Trying to dispatch event to queue but no channel with the ' +
            'message queue is created'
          );
        }

        const stats = await getFileStats(filesToWatch[key].path);

        const fileModTime = stats.mtimeMs;
        if (fileModTime <= filesToWatch[key].lastModified) { return; }

        logger.info({
          message: `File ${filesToWatch[key].path} change detected.`
        });

        const reMatches = filesToWatch[key].path.match(/\.([^.]+)$/i);
        if (reMatches === null) {
          throw new Error(
            `The file type for "${filesToWatch[key].path}" ` +
            'could not be determined.'
          );
        }

        const fileType = reMatches[1];
        if (fileTypeHandlers[fileType] === undefined) {
          throw new Error(
            `The file type "${fileType}" is not an expected file type.`
          );
        }

        filesToWatch[key].lastModified = fileModTime;

        const fileContent = await fileTypeHandlers[fileType](
          filesToWatch[key].path
        );
        if (fileContent === undefined) { return; }

        await mqCacheStoreObject({
          mqChannel: channel,
          payload: {
            key: filesToWatch[key].persistKey,
            value: fileContent,
          },
        });

        logger.info({
          message: `File ${filesToWatch[key].path} updated in cache.`
        });
      } catch (error) {
        logger.error({
          message: error.message,
          payload: error,
        });
      }
    });
  };

  const startCheckUp = (): void => {
    if (intervalId !== null) { return; }

    regularFileCheckup();

    intervalId = global.setInterval(
      regularFileCheckup,
      parseInt(process.env.SLEEP_MS || '30000')
    );
  };

  const endCheckUp = (): void => {
    if (intervalId === null) { return; }

    global.clearInterval(intervalId);
    intervalId = null;
  };

  return({
    endCheckUp,
    startCheckUp,
  });
}