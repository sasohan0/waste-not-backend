require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}

const uri = process.env.DATABASE_URL;

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

    const userDB = client.db("userDB");
    const userCollection = userDB.collection("userCollection");

    //product
    app.post("/products", verifyToken, async (req, res) => {
      const productsData = req.body;
      const result = await productCollection.insertOne(productsData);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const productsData = productCollection.find();
      const result = await productsData.toArray();

      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const productsData = await productCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(productsData);
    });
    app.patch("/products/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });
    app.delete("/products/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // user
    app.get("/user", verifyToken, async (req, res) => {
      const usersData = userCollection.find();
      const result = await usersData.toArray();
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const user = req.body;

      const token = createToken(user);
      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          statu: "success",
          message: "Login success",
          token,
        });
      }
      await userCollection.insertOne(user);
      console.log(token);
      return res.send({ token });
    });

    // user/test@gmail

    app.get("/user/get/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });

    console.log("successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});
