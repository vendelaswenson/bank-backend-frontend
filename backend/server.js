import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = 8000;

const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("users");
const accounts = db.collection('accounts');
app.use(express.json());

app.use(express.static("frontend"));
app.use(express.static("public"));

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
    await accounts.updateOne({_id: ObjectId(req.params.id)}, {$set: {...req.body}})
 
    res.json('updated')
 })


app.delete('/api/accounts/erase/:id', async (req, res) => {
    const acc = await accounts.findOne({_id: ObjectId(req.params.id)})

    await accounts.deleteOne(acc);

    res.json({
        message: 'deleted'
    })
})