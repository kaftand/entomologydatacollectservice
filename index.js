

'use strict';

// [START app]
const express = require('express');
var bodyParser = require('body-parser')
const stringify = require('csv-stringify/lib/sync')
const db = require('./database/GoogleCloudConn.js')

var app = express()
// parse application/x-www-form-urlencoded
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({ extended: false }))

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    const resCallBack = function(kinds2keep) {
        res.render('index', {kinds: kinds2keep, error: null});
    }
    db.getTableNames(resCallBack)
});

app.get('/helloWorld', function (req, res) {
    var a = 1
    res.render('Hello World');
});

app.post('/HLC', function (req, res) {
    const resCallBack = function() {console.log("saved")
        res.status(200).send('Saved').end()}
    const errCallBack = function() {res.status(200).send('Error').end()}
    db.postHLCData(resCallBack, errCallBack, req)
});

app.post('/HutStudy', function (req, res) {
    const resCallBack = function() {console.log("saved")
        res.status(200).send('Saved').end()}
    const errCallBack = function() {res.status(200).send('Error').end()}
    db.postHutStudyData(resCallBack, errCallBack, req)
});

app.get("/selectKind", (req, res) => {
    const resCallBack = function(selectedForm, uniqueProjectCodes) {res.render('selectedFormType', {formType: selectedForm, projectCodes: uniqueProjectCodes})}
    db.getProjectCodes(resCallBack, req.query.formType)
})

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});


app.get("/downloadCSV", function (req, res) {
    db.downloadCSV(req, res)

});




// [END app]
