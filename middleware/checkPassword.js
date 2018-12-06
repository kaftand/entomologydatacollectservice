const config = require('../.config')
const jwt = require("jsonwebtoken")


module.exports = function (req, res, next) {

    if ((req.headers.username == config.username) & (req.headers.password == config.password)) {
        next()
    } else {
        return res.json({success:false,
                        message:"incorrect token"})
    }

}
