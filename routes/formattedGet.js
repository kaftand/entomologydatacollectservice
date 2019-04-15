const db = require('../database/GoogleCloudConn.js')
const express = require("express")
const passwordMiddleware = require("../middleware/checkPassword.js")

var apiRouter = express.Router()
apiRouter.use(passwordMiddleware)

apiRouter.get('/CDC_HDT', function (req, res) {
    db.getFormattedData("CDC_HDT", req.query.serial, res)
});

apiRouter.get('/IndoorRestingCollection', function (req, res) {
    db.getFormattedData("IndoorRestingCollection", req.query.serial, res)
});

apiRouter.get('/HLC', function (req, res) {
    db.getFormattedData("HLC", req.query.serial, res)
});

apiRouter.get('/ConeBioassay', function (req, res) {
    db.getFormattedData("ConeBioassay", req.query.serial, res)
});

module.exports = apiRouter
