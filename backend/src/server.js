'use strict';

const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`[server] LuxAngels backend running on port ${config.port} (${config.nodeEnv})`);
});
