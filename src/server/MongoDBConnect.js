const mongoose = require("mongoose");
mongoose.Promise = Promise;
mongoose.set("useCreateIndex", true);
var mongooseOptions = { useNewUrlParser: true };

mongoose.connect(
  "mongodb://localhost:27017/SavedMessages",
  mongooseOptions,
  function(err) {
    if (err) {
      console.error("System could not connect to mongo server.");
      console.log(err);
    } else {
      console.log("System connected to mongo server.");
    }
  }
);

var MongoClient = require("mongodb").MongoClient;

const mongoUrl = "mongodb+srv://localhost/27017/SavedMessages"; // your URL goes here
const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });

mongoClient.connect(function(err) {
  console.log("Connected to MongoDB".green);
});

// Schema should look like:
// Object id: "reft4ht5y4thr-gt5gerh" (this is a string given to the object)
// message: [], (this should contain the message itself)
//  name: community (the chat its going too)
// users: [] (this should be the user who typed it)
