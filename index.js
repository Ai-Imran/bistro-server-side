const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())
console.log(process.env.DB_USER);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mbzvmhe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menuCollection = client.db('bistroDb').collection('menu');
    const reviewsCollection = client.db('bistroDb').collection('reviews');
    const cartCollection = client.db('bistroDb').collection('carts');

    app.get('/menu', async(req,res) => {
      const result = await menuCollection.find().toArray();
      res.send(result)

    })

    app.get('/reviews', async(req,res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result)

    })

    app.delete('/carts/:id', async(req,res)=>{
      const id  = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ObjectId' });
      }
      const query = {_id: new ObjectId(id)}
      try {
        const result = await cartCollection.deleteOne(query);
        console.log(result);
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // carts collection
    app.get('/carts', async(req,res) =>{
      const email = req.query.email;
      const query = {email: email}
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })
    app.post('/carts', async(req,res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) => {
  res.send('all is done')
})

app.listen(port,()=>{
  console.log(`All reserved by ${port}`);
})
