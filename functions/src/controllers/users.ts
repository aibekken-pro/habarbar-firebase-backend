import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';
import axios from 'axios';

export const userApp = express();
userApp.use(cors({origin: true}));

// get all users with complete info
userApp.get('', async (req, res) => {
  try {
    const users = await admin.auth().listUsers();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send();
  }
})


// get user by id
userApp.get('/:id', async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.params.id)
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
})

// update user by id
userApp.put('/:id', async (req, res) => {
  try {
    const user = await admin.auth().updateUser(req.params.id, req.body)
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
})


// delete user by id
userApp.delete('/:id', async (req, res) => {
  try {
    const user = await admin.auth().deleteUser(req.params.id)
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
})

// create user 
userApp.post('/signup', async (req, res) => {
  try {
    await admin.auth().createUser(req.body);
    res.status(200).send('user created');
  } catch (error) {
    res.status(500).send(error);
  }
})

// sing in user
userApp.post('/signin',async (req, res) => {
  const url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCntUDif_nPR_6shUI5h0EiMlcGPBghjTk';
  try {
    const response = await axios.post(url, req.body);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
})