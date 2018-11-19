

'use strict';

// [START app]
const express = require('express');
var bodyParser = require('body-parser')
var getData = require("./routes/GetData.js")
var hLCPost = require("./routes/HLCPost.js")
var authenticateMiddleware = require("./middleware/checkAuth.js")
var authenticate = require("./routes/authenticate.js")
var hutStudyPost = require("./routes/HutStudyPost.js")
var login = require("./routes/login.js")
var cookieParser = require('cookie-parser')

var app = express()
// parse application/x-www-form-urlencoded
app.use(express.static(__dirname + '/'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({ extended: false }))
app.set('view engine', 'ejs')


app.use("/HLC", hLCPost)
app.use("/HutTrial", hutStudyPost)
app.use("/IndoorRestingCollection", hLCPost)
app.use("/CDC_HDT", hLCPost)
app.use("/login", login)
app.use("/authenticate", authenticate)
app.use(authenticateMiddleware)
app.use("/", getData)






// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
