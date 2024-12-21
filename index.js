const express = require('express')

const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()
const port =process.env.port || 5000
const app = express();

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://vaicals-shop:p5dv3f8vYT4dLFu0@mernblog.fs7w4.mongodb.net/?retryWrites=true&w=majority&appName=MernBlog";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const database = client.db('vaicals');
const userCollection = database.collection('users')
const fieldsCollection = database.collection('fields')
const formAdminCollection = database.collection('AdminData')
const formUserCollection = database.collection('userData')
async function run() {
  try {
    app.post('/user',async(req,res)=>{
        const user = req.body;
        const isExist = await userCollection.findOne({email:user.email});
        if(!isExist){
            const result = await userCollection.insertOne(user);
            res.send(result)
            return
        }
        return res.send({message:"user Already Exist"})


    })

    app.get('/fromData',async(req,res)=>{
        const result = await formUserCollection.find().toArray()
        res.send(result)
    })
    app.post('/fromData/:email',async(req,res)=>{
        const data = req.body
        console.log(data)
        const email =req.params.email
        const user = await userCollection.findOne({email:email})
        console.log(user)
        if(user.role ==='admin'){
            const result = await formAdminCollection.insertOne(data);
            return res.send(result)
        }
        const result = await formUserCollection.insertOne(data);
        return res.send(result)


    })
    const { ObjectId } = require('mongodb');

app.post('/fields/:id/addChild', async (req, res) => {
    const { id } = req.params; 
    const childField = req.body;

    try {
    
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid field ID' });
        }

        

       
        const result = await fieldsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $push: { childFields: childField } }
        );

        
        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Parent field not found' });
        }

        // Send success response
        res.send({ message: 'Child field added successfully', result });
        console.log(id)
    } catch (error) {
        console.error('Error adding child field:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

    
app.delete('/fields/:id/deleteChild', async (req, res) => {
  const { id } = req.params; 
  const { childName } = req.body; 

  try {
   
      if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid parent field ID' });
      }

    
      if (!childName) {
          return res.status(400).send({ message: 'Child name is required for deletion' });
      }

      
      const result = await fieldsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $pull: { childFields: { name: childName } } }
      );

      if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Parent field not found' });
      }

      if (result.modifiedCount === 0) {
          return res.status(400).send({ message: 'Child field not found or not deleted' });
      }

      res.send({ message: 'Child field deleted successfully', result });
  } catch (error) {
      console.error('Error deleting child field:', error);
      res.status(500).send({ message: 'Internal Server Error' });
  }
});
    app.get('/user/:email',async(req,res)=>{
        const email = req.params.email
        const result = await userCollection.findOne({email:email})
        console.log(result)
        
        res.send(result)
    })
    app.get('/fields',async(req,res)=>{
        const result = await fieldsCollection.find().toArray()
   
        res.send(result)
    })
    app.post('/fields',async(req,res)=>{
        const body =req.body
        const result = await fieldsCollection.insertOne(body)
      
        res.send(result)
    })
    app.delete('/fields/:id',async(req,res)=>{
        const id =req.params.id
        const query = {_id:new ObjectId(id)}
       
        const find = await fieldsCollection.findOne(query)
     
        const result = await fieldsCollection.deleteOne(query)
        
        res.send(result)
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>console.log(`listening Port${port}`))