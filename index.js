

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
const Fields = {HLC: ["PROJECT_CODE","CLUSTER_NUMBER","HOUSE_NUMBER","VILLAGE","DATE","VOLUNTEER_NUMBER","IN_OR_OUT","HOUR","GAMBIAE","FUNESTUS","COUSTANI","MANSONIA","AEDES","COQUILETTIDIA","OTHER"],
HutStudy:
["HUT_NUMBER", "TRAP_ID", "NET_NUMBER", "VOLUNTEER_NUMBER", "GAMBIAE_MORNING_UNFED_ALIVE", "GAMBIAE_MORNING_UNFED_DEAD", "GAMBIAE_MORNING_FED_ALIVE", "GAMBIAE_MORNING_FED_DEAD", "GAMBIAE_24HR_UNFED_ALIVE", "GAMBIAE_24HR_UNFED_DEAD", "GAMBIAE_24HR_FED_ALIVE", "GAMBIAE_24HR_FED_DEAD", "FUNESTUS_MORNING_UNFED_ALIVE", "FUNESTUS_MORNING_UNFED_DEAD", "FUNESTUS_MORNING_FED_ALIVE", "FUNESTUS_MORNING_FED_DEAD", "FUNESTUS_24HR_UNFED_ALIVE", "FUNESTUS_24HR_UNFED_DEAD", "FUNESTUS_24HR_FED_ALIVE", "FUNESTUS_24HR_FED_DEAD", "CULEX_MORNING_UNFED_ALIVE", "CULEX_MORNING_UNFED_DEAD", "CULEX_MORNING_FED_ALIVE", "CULEX_MORNING_FED_DEAD", "CULEX_24HR_UNFED_ALIVE", "CULEX_24HR_UNFED_DEAD", "CULEX_24HR_FED_ALIVE", "CULEX_24HR_FED_DEAD", "OTHER_FEMALE_COUNT", "OTHER_GENUS", "PROJECT_CODE", "DATE"]}

app.get("/downloadCSV", function (req, res) {
    const query = datastore
        .createQuery(req.query.formType)
        .filter('PROJECT_CODE', '=', req.query.projectCode);
    var callBack = getCSVCallBack(req.query.formType, res)
    datastore.runQuery(query).then(callBack).catch(function(error) {
        console.log(error)
    });
});


function getCSVCallBack(formType, res)
{
    var callBack = results => {
      // Task entities found.
        var resultsData = results[0];
        var theseFields = (Fields[formType])
        const opts = {  columns:theseFields,
                        header:true};
        try {
            const csv = stringify(resultsData, opts);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);
        } catch (err) {
          console.error(err);
        }
    }
    return callBack

}

// [END app]
