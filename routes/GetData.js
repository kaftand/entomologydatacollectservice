const db = require('../database/GoogleCloudConn.js')
const express = require("express")

var apiRouter = express.Router()

apiRouter.get('/', function (req, res) {
    const resCallBack = function(kinds2keep) {
        res.render('index', {kinds: kinds2keep, error: null});
    }
    db.getTableNames(resCallBack)
});

apiRouter.get("/selectKind", (req, res) => {
    const resCallBack = function(selectedForm, uniqueProjectCodes) {res.render('selectedFormType', {formType: selectedForm, projectCodes: uniqueProjectCodes})}
    db.getProjectCodes(resCallBack, req.query.formType)
})

apiRouter.get("/downloadCSV", function (req, res) {
    db.downloadCSV(req, res)

});

module.exports = apiRouter
