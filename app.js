const path = require("path");
const express = require("express");
// const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');

const mongoDbStore = require('connect-mongodb-session')(session);
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/depa-sc';
const MONGODB_URI = 'mongodb+srv://hammdepa:LRloKdxkmajvDUIi@cluster0.acbqjha.mongodb.net/depa-sc-test?retryWrites=true&w=majority&appName=Cluster0';


const app = express();
const csrfProtection = csrf(); 

const store = new mongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set("view engine", "ejs");
app.set("views", "views");

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(session({
  secret: 'my secret for depa',
  resave: false,
  saveUninitialized: false,
  store: store,
}))

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
})

const authRoute = require("./routes/auth");
const mainRoute = require("./routes/main");
const adminRoute = require("./routes/admin.js");
const cityRoute = require("./routes/city");

app.use(authRoute);
app.use(mainRoute);
app.use("/admin", adminRoute);
app.use("/city", cityRoute);


mongoose.connect(MONGODB_URI)
const server = app.listen(8888, () => {
  console.log("******************************");
  console.log(
    `depa-SmartCity-WebTracking is running on port ${server.address().port}`
  );
  console.log(`http://localhost:${server.address().port}`);
  console.log("******************************");
});