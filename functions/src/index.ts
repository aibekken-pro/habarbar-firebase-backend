import * as functions from "firebase-functions";
import * as express from "express";
//import * as cors from "cors";
import * as admin from "firebase-admin";
import { IAdCreate, IAd, IGetAd} from "./models/rest-api-models";

admin.initializeApp();

const app = express();

//create ad
app.post("/", async (req, res) => {
  try {
    const ad: IAdCreate = req.body;
    await admin.firestore().collection("habar-ads").add(ad);
    res.status(201).send('ad was created');
  } catch (error) {
    res.status(500).send()
  }
});

//get all ads 
app.get('/', async(req, res) => {
  try {
    const snapshot = await admin.firestore().collection('habar-ads').get()
    let ads: IGetAd[] = []
    
    snapshot.forEach((doc) => {
      const ad:IGetAd = {
        id: doc.id,
        ...doc.data() as IAd
      }
      ads.push(ad);
    })
    res.status(200).send(ads);
  } catch (error) {
    res.status(500).send(error)
  }
})

export const ads = functions.https.onRequest(app);
