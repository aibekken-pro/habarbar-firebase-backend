import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';
import {IAdCreate, IAd, IGetAd} from '../models/rest-api-models';

admin.initializeApp();

export const adApp = express();
adApp.use(cors({origin: true}));

const db = admin.firestore();

// create ad
adApp.post('/', async (req, res) => {
  try {
    const ad: IAdCreate = req.body;
    await db.collection('habar-ads').add(ad);
    res.status(201).send('ad was created');
  } catch (error) {
    res.status(500).send(error);
  }
});

// get all ads
adApp.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('habar-ads').get();
    const ads: IGetAd[] = [];

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

// get ad
adApp.get('/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('habar-ads').doc(req.params.id).get();
    const ad: IGetAd = {
      id: snapshot.id,
      ...(snapshot.data() as IAd),
    };
    res.status(200).send(ad);
  } catch (error) {
    res.status(500).send(error);
  }
});

// edit ad
adApp.patch('/:id', async (req, res) => {
  try {
    const body: Partial<IAdCreate> = req.body;
    await admin.firestore().collection('habar-ads')
        .doc(req.params.id).update({...body});
    res.status(200).send('ad updated');
  } catch (error) {
    res.status(500).send();
  }
});

// delete
adApp.delete('/:id', async (req, res) => {
  try {
    await db.collection('habar-ads').doc(req.params.id).delete();
    res.status(200).send('ad deleted');
  } catch (error) {
    res.status(500).send(error);
  }
});
