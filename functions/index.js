const functions = require("firebase-functions");
const express = require("express");
const app = express();

const coordi = require("./routes/coordi");
app.use("/coordi", coordi);
app.use("/", (req, res)=>{
  res.send("hello");
});
const api = functions.https.onRequest(app);
module.exports = {api};
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
