const path = require('path');
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));

const authRoute = require('./routes/auth');
const mainRoute = require('./routes/main');
const cityRoute = require('./routes/city');

app.use(authRoute);
app.use(mainRoute);
app.use('/city', cityRoute);


const server = app.listen(8888, () => {
    console.log("******************************");
    console.log(`depa-SmartCity-WebTracking is running on port ${server.address().port}`);
    console.log(`http://localhost:${server.address().port}`)
    console.log("******************************");
});