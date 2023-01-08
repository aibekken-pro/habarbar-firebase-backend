import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import {IAd, IGetAd} from '../models/rest-api-models';
import * as authMiddleWare from 'firebase-auth-express-middleware';

admin.initializeApp();

export const adApp = express();
adApp.use(cors({origin: true}));

const db = admin.firestore();

// create ad
adApp.post('/', authMiddleWare.authn(admin.auth()), async (req, res) => {
  try {
    const createDate = new Date();
    const creatorId = jwt.decode(req.headers.authorization!.split(' ')[1], {json: true})?.sub
    const ad: IGetAd = {
      creatorId,
      createDate,
      moderated: false,
      lastEditDate: createDate,
      ...req.body
    };
    await db.collection('habar-ads').add(ad);
    res.status(201).send('ad was created');
  } catch (error) {
    res.status(500).send(error);
  }
});

// get all ads
adApp.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ?  +req.query.limit : 10;
    const startIndex = req.query.page ?  +req.query.page * limit : 0;

    const searchText = req.query?.search;
    const location = req.query?.location;
    const category = req.query?.category;

    let dbAdsCollect: admin.firestore.Query<admin.firestore.DocumentData> =db.collection('habar-ads')

      if (location) {
        dbAdsCollect = dbAdsCollect.where('location', '==', location)
      } 
      
      if (category) {
        dbAdsCollect = dbAdsCollect.where('category', '==', category)
      }

      if(!searchText) {
        dbAdsCollect = dbAdsCollect.limit(limit).offset(startIndex)
      }


    const snapshot = await dbAdsCollect.get();
    let ads: IGetAd[] = [];

    snapshot.forEach((doc) => {
      const ad: IGetAd = {
        id: doc.id,
        ...(doc.data() as IAd),
      };
      ads.push(ad);
    });
    // through firestore there is no way to do a search by keyword
    if(req.query.search?.length) {
      const searchQueries = (req.query.search as string).split(' ')
    
      let matches: [IGetAd, number][] = []
      ads.forEach(ad => {
        let count = 0; 
        for (let query of searchQueries) {
          if(ad.title.includes(query)) count += 1;
        }
        if(count) {
          matches.push([ad, count])
        }
      })

      ads = matches.sort((a, b) => b[1] - a[1]).map(item => item[0])
    }  
    res.status(200).send(ads);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get ad
adApp.get('/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('habar-ads').doc(req.params.id).get();
    let ad: IGetAd = {
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
    const body: Partial<IGetAd> = { lastEditDate: new Date(), ...req.body };
    await db.collection('habar-ads')
        .doc(req.params.id).update(body);
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
    const limit = req.query.limit ?  +req.query.limit : 10;
    const startIndex = req.query.page ?  +req.query.page * limit : 0;
    const snapshot = await db
      .collection('habar-ads')
      .where('author.id', '==', req.params.id)
      .limit(limit)
      .offset(startIndex)
      .get();
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

//get ads by category
adApp.get('/categories/:category', async (req, res) => {
  try {
    const limit = req.query.limit ?  +req.query.limit : 10;
    const startIndex = req.query.page ?  +req.query.page * limit : 0;
    const snapshot = await db
      .collection('habar-ads')
      .where('category', '==', req.params.category)
      .limit(limit)
      .offset(startIndex)
      .get();
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
