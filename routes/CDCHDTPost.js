const db = require('../database/GoogleCloudConn.js')
const express = require("express")

var apiRouter = express.Router();

apiRouter.post('/', function (req, res) {
    const resCallBack = function() {console.log("saved")
        res.status(200).send('Saved').end()}
    const errCallBack = function() {res.status(200).send('Error').end()}
    db.postHLCData(resCallBack, errCallBack, req)
});

module.exports = apiRouter
