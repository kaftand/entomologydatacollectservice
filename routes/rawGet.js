const db = require('../database/GoogleCloudConn.js')
const express = require("express")
const passwordMiddleware = require("../middleware/checkPassword.js")

var apiRouter = express.Router()
apiRouter.use(passwordMiddleware)

apiRouter.get('/CDC_HDT', function (req, res) {
    db.getRawData("CDC_HDT", req.query.serial, res)
});

apiRouter.get('/IndoorRestingCollection', function (req, res) {
    db.getRawData("IndoorRestingCollection", req.query.serial, res)
});

apiRouter.get('/HLC', function (req, res) {
    db.getRawData("HLC", req.query.serial, res)
});

apiRouter.get('/ConeBioassay', function (req, res) {
    db.getRawData("ConeBioassay", req.query.serial, res)
});

module.exports = apiRouter
