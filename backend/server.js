import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import session from 'express-session';
import bcrypt from 'bcrypt';

const app = express();
const port = 8000;
const saltRounds = 10;

const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("users");
const accounts = db.collection('accounts');
const usersCol = db.collection('user');

app.use(express.json());

app.use(express.static("frontend"));
app.use(express.static("public"));

app.use(session({
    resave: false, 
    saveUninitialized: false, 
    secret: 'shhhh, very secret',
    cookie: {
        maxAge: 5 * 60 * 1000 
      }
}));


  app.post('/api/accounts/login', async (req, res) => {
    const user = await usersCol.findOne({ name: req.body.name });
    const passMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (user && passMatch) {
      req.session.name = user.name;
      
      res.json({
        name: user.name
      });
    } else { 
      res.status(401).json({ error: 'Unauthorized' });
    }
  });


  app.get('/api/accounts/loggedin', (req, res) => {
    if (req.session.name) {
      res.json({
        user: req.session.name
      });
    } else { 
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  app.post('/api/accounts/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({
        loggedin: false
      });
    });
  });


app.post('/api/accounts/register', async (req, res) => {
    const user = await usersCol.findOne({name: req.body.name});

    if (user) {
        res.status(401).json({error: "User exists"})
    } else {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        await usersCol.insertOne({name: req.body.name, password: hash,})

        res.json({success: true, user: req.body.name,})
    }
})


app.get('/api/accounts/user', (req, res) => {
    res.json({ user: req.session.user });
});

app.get('/api/accounts', async (req, res) => {
    const accs = await accounts.find({}).toArray();
    res.json(accs)
})

app.get('/api/accounts/:id', async (req, res) => {
    const acc = await accounts.findOne({_id: ObjectId(req.params.id)})
    res.json(acc)
 })


app.listen(port, () => {
    console.log("listening");
})

app.post('/api/accounts/new', async (req, res) => {
    await accounts.insertOne({
        ...req.body
})
res.redirect('/api/accounts')
})

app.put('/api/accounts/update/:id', async (req, res) => {
    const acc = await accounts.findOne({_id: ObjectId(req.params.id)});

    if (req.body.amount < 0) {
        res.status(401).json({error: "Täckning saknas"})
    } else {
        await accounts.updateOne({_id: ObjectId(req.params.id)}, {$set: {...req.body}})
        res.json('updated');
    }
 })


app.delete('/api/accounts/erase/:id', async (req, res) => {
    const acc = await accounts.findOne({_id: ObjectId(req.params.id)})

    await accounts.deleteOne(acc);

    res.json({
        message: 'deleted'
    })
})