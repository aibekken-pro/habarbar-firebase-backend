import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import {IAdCreate, IAd, IGetAd} from '../models/rest-api-models';
import * as authMiddleWare from 'firebase-auth-express-middleware';

admin.initializeApp();

export const adApp = express();
adApp.use(cors({origin: true}));

const db = admin.firestore();

// create ad
adApp.post('/', authMiddleWare.authn(admin.auth()), async (req, res) => {
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

const checkIsAuthor = (snapshot: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>, token?: string ) : boolean => {
  if(token) {

    const decodedToken =jwt.decode(token.split(' ')[1], {json: true})
    return decodedToken?.sub === snapshot.data()?.author?.id    
  } else {
    return false;
  }
}

// edit ad
adApp.patch('/:id', authMiddleWare.authn(admin.auth()), async (req, res) => {
  try {
    const snapshot  = await db.collection('habar-ads').doc(req.params.id).get();
    if(!checkIsAuthor(snapshot, req.headers.authorization)) {
      res.status(403).send('not allowed');
      return;
    }
    const body: Partial<IAdCreate> = req.body;
    await db.collection('habar-ads')
        .doc(req.params.id).update({...body});
    res.status(200).send('ad updated');
  } catch (error) {
    res.status(500).send();
  }
});

// delete
adApp.delete('/:id', authMiddleWare.authn(admin.auth()), async (req, res) => {
  try {
    const snapshot  = await db.collection('habar-ads').doc(req.params.id).get();
    if(!checkIsAuthor(snapshot, req.headers.authorization)) {
      res.status(403).send('not allowed');
      return;
    }
    await db.collection('habar-ads').doc(req.params.id).delete();
    res.status(200).send('ad deleted');
  } catch (error) {
    res.status(500).send(error);
  }
});

//get user ads
adApp.get('/user/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('habar-ads').where('author.id', '==', req.params.id).get();
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
})