const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://sasohanme:aiV0BrcM2sIb86BM@waste-not-database.1kpws26.mongodb.net/?retryWrites=true&w=majority&appName=waste-not-database";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const productDB = client.db("productDB");
    const productCollection = productDB.collection("productCollection");

    //product
    app.post("/shoes", verifyToken, async (req, res) => {
      const shoesData = req.body;
      const result = await shoesCollection.insertOne(shoesData);
      res.send(result);
    });

    app.get("/shoes", async (req, res) => {
      const shoesData = shoesCollection.find();
      const result = await shoesData.toArray();
      res.send(result);
    });

    app.get("/shoes/:id", async (req, res) => {
      const id = req.params.id;
      const shoesData = await shoesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(shoesData);
    });
    app.patch("/shoes/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await shoesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });
    app.delete("/shoes/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await shoesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    console.log("successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});
