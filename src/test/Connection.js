//MongoDB section
const mongoose = require("mongoose");
const color = require("colors");
//ES6 Promises
mongoose.Promise = global.Promise;

// Connect to DB before running test
before(function(done) {
  // Connect to mongodb
  mongoose.connect("mongodb://localhost/mariochar", { useNewUrlParser: true });

  mongoose.connection
    .once("open", function(err) {
      console.log("Connection has been made...".green);
    })
    .on("error", function(err) {
      console.log("Connection failed, err: ".red + err);
    });
  done();
});
