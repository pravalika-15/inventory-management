const mongoose = require("mongoose");
async function connectToDatabase() {
  try {
    await mongoose.connect(
      "mongodb+srv://attadapravalika:attadapravalika@cluster0.qacckf7.mongodb.net/products",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "products",
      }
    );

    console.log("Connected to the database.");

    // Fetching collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((collection) => collection.name);
    console.log("Collections:", collectionNames);

  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

module.exports = connectToDatabase;
