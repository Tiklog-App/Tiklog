import http from 'http';

import 'dotenv/config';

import app, { corsOptions } from './app';
import startup from './startup';
import AppLogger from './utils/AppLogger';
import { Server as SocketServer } from 'socket.io';
import RabbitMqService from './services/RabbitMqService';
const rabbitMqService = new RabbitMqService();

const logger = AppLogger.init('server').logger;
const port = process.env.PORT || 5050;

const server = http.createServer(app);

async function startRabbitMqService() {
  await rabbitMqService.connectToRabbitMQ();
  await rabbitMqService.listenForPackageRequests();
  await rabbitMqService.listenForDriverResponses();
  rabbitMqService.setupSocketIO(server);
}

const io = new SocketServer(server, {
  cors: corsOptions,
});

io.on('connection', socket => {
  console.log('Socket connected:', socket.id)
  logger.info(socket.id);
});

startup(io).catch(console.error);

startRabbitMqService().then(() => {
  server.listen(port, () => logger.info(`Server running on port: ${port}`));
});