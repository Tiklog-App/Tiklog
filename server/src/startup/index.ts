import { Server as SocketServer } from 'socket.io';
import database from '../config/database';
import dataStore from '../config/dataStore';
import CommandLineRunner from '../helpers/CommandLineRunner';

export default async function startup() {
  dataStore.init();
  await database.mongodb();
  await CommandLineRunner.run();
}
