import { AGENDA_COLLECTION_NAME } from '../config/constants';
import database from '../config/database';
import dataStore from '../config/dataStore';
import CommandLineRunner from '../helpers/CommandLineRunner';
import CronJob from '../helpers/CronJob';
import { Agenda } from 'agenda';

export default async function startup() {
  dataStore.init();
  await database.mongodb();
  await CommandLineRunner.run();

  const agenda = new Agenda({
    db: {
      address: database.mongoUrl,
      collection: AGENDA_COLLECTION_NAME,
    },
  });

  agenda.define('vehicleLicenseIsExpired', { concurrency: 1 }, async (job: any) => {
    await CronJob.vehicleLicenseIsExpired()
  });

  await agenda.start();
  await agenda.every('0 0 * * *', 'vehicleLicenseIsExpired');
}
