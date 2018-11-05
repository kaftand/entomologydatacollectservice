const implementjs = require("implement-js")

const implement = implementjs.default
const { Interface, type } = implementjs

const DatabaseConn = Interface("DatabaseConn") ({
    postHLCData : type("function"),
    getHLCCols : type("function"),
    getTableNames : type("function")},
    {
        error: true,
        strict: false
    }
)


module.exports = DatabaseConn
