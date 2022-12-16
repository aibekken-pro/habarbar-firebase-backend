import * as functions from 'firebase-functions';
import * as express from 'express';
//import * as cors from "cors";
import * as admin from 'firebase-admin';
import { IAdCreate, IAd, IGetAd } from './models/rest-api-models';

admin.initializeApp();

const app = express();

//create ad
app.post('/', async (req, res) => {
  try {
    const ad: IAdCreate = req.body;
    await admin.firestore().collection('habar-ads').add(ad);
    res.status(201).send('ad was created');
  } catch (error) {
    res.status(500).send();
  }
});

//get all ads
app.get('/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('habar-ads').get();
    let ads: IGetAd[] = [];

    snapshot.forEach((doc) => {
      const ad: IGetAd = {
        id: doc.id,
        ...(doc.data() as IAd),
      };
      ads.push(ad);
    });
    res.status(200).send(ads);
  } catch (error) {
    res.status(500).send(error);
  }
});

//get all ads
app.get('/:id', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('habar-ads').doc(req.params.id).get();
    const ad: IGetAd = {
      id: snapshot.id,
      ...(snapshot.data() as IAd),
    };
    res.status(200).send(ad);
  } catch (error) {
    res.status(500).send(error);
  }
});

//edit ad
app.patch('/:id', async (req, res) => {
  try {
    const body: Partial<IAdCreate> = req.body;
    await admin
      .firestore()
      .collection('habar-ads')
      .doc(req.params.id)
      .update({
        ...body,
      });
    res.status(200).send('ad updated');
  } catch (error) {
    res.status(500).send();
  }
});

export const ads = functions.https.onRequest(app);
