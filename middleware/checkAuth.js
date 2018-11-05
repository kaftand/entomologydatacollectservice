const config = require('../.config')
const jwt = require("jsonwebtoken")


module.exports = function (req, res, next) {
    var token = null
    if (req.cookies) {
        token = req.cookies.token
    }

    if(token) {
        jwt.verify(token, config.secret,
            function(err, decoded) {
                if (err) {
                    return res.json({success:false,
                                    message:"incorrect token"})
                } else {
                    req.decoded = decoded
                    next()
                }
            }
        )
    } else {
        res.redirect("/login")
        return res.json({success:false,
                        message:"no token"})
    }

}
