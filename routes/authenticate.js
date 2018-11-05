const config = require('../.config')
const express = require("express")
const jwt = require("jsonwebtoken")

    var apiRouter = express.Router()
    apiRouter.post("/", function(req, res) {
        if((req.body.username == config.username) & (req.body.password == config.password)) {
            const token = jwt.sign({"user":req.body.username}, config.secret, {
                expiresIn: "1hr"
            })
            res.cookie("token", token)
            res.redirect(302, '/')
        } else {
            res.render("login", {
                failed:true,
            })
        }
    })
    module.exports = apiRouter
