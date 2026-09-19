import { SetMetadata } from '@nestjs/common';

export const BIZ_LOG_KEY = 'fikr:bizLog';

/** Human action printed when this controller method runs, e.g. `start taking attendance`. */
export const BizLog = (action: string) => SetMetadata(BIZ_LOG_KEY, action);
