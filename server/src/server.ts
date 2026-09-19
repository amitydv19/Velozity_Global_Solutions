import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initSocketServer } from './sockets/socket.js';
import { startOverdueTaskJob } from './jobs/overdueTask.job.js';

const app = createApp();
const server = http.createServer(app);

initSocketServer(server);
startOverdueTaskJob();

server.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
