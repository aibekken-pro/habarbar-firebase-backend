import * as functions from 'firebase-functions';
import { adApp } from './controllers/habar-ad';

export const ads = functions.https.onRequest(adApp);