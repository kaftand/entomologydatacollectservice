const express = require("express")

var apiRouter = express.Router()

apiRouter.get('/', function (req, res) {
    res.render('login', {"failed":false});

});

module.exports = apiRouter
