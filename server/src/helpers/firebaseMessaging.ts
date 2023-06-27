import * as admin from 'firebase-admin';

import { messaging } from 'firebase-admin/lib/messaging/messaging-namespace';
import { appCommonTypes } from '../@types/app-common';
import App = admin.app.App;
import Notification = messaging.Notification;
import AnyObjectType = appCommonTypes.AnyObjectType;
import axios from 'axios';

type FirebaseMsgConfig = {
  serviceAccount: admin.ServiceAccount | string;
};

type SendToOneConfig = {
  data?: AnyObjectType;
  token: string;
  notification: Notification;
};

type SendToManyConfig = Omit<SendToOneConfig, 'token'> & { tokens: string[] };

export default function firebaseMessaging(config?: FirebaseMsgConfig) {
  let app: ReturnType<() => App>;

  if (config && config.serviceAccount) {
    app = admin.initializeApp({ credential: admin.credential.cert(config.serviceAccount) });
  } else app = admin.initializeApp();

  const baseURL = "https://exp.host/--/api/v2/push/send";

  return {
    async sendToOne(config: SendToOneConfig) {

      await app.messaging().send({
        data: config.data,
        token: config.token,
        notification: config.notification,
      });

      await axios.post(baseURL, {
        to: config.token,
        title: config.notification.title,
        body: config.notification.body,
        data: config.data,
      })
    },

    async sendToMany(config: SendToManyConfig) {
      
      await app.messaging().sendMulticast({
        data: config.data,
        tokens: config.tokens,
        notification: config.notification,
      });

      await axios.post(baseURL, {
        to: config.tokens,
        title: config.notification.title,
        body: config.notification.body,
        data: config.data,
      })
    },
  };
}
