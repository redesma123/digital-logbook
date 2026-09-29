import { app } from './app.js';
import { env } from './lib/env.js';
import { initRetentionCron } from './jobs/photo-retention.job.js';

if (env.NODE_ENV !== 'test') {
  initRetentionCron();
}

app.listen(env.PORT, () => {
  console.log(`HYDRO-MON API running on port ${env.PORT}`);
});

