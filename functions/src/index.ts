import * as functions from 'firebase-functions';
import {adApp} from './controllers/habar-ad';
import { userApp } from './controllers/users';

export const ads = functions.https.onRequest(adApp);
export const users = functions.https.onRequest(userApp);
