import { app } from './app.js';
import { env } from './lib/env.js';

app.listen(env.PORT, () => {
  console.log(`HYDRO-MON API running on port ${env.PORT}`);
});
