

'use strict';

// [START app]
const express = require('express');
var bodyParser = require('body-parser')
const Datastore = require('@google-cloud/datastore');
const stringify = require('csv-stringify/lib/sync')

var app = express()
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({ extended: false }))

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    const query = datastore.createQuery('__kind__').select('__key__');

    datastore.runQuery(query).then(results => {
        const entities = results[0];
        const kinds = entities.map(entity => entity[datastore.KEY].name);

        console.log('Kinds:');
        kinds.forEach(kind => console.log(kind));
        res.render('index', {kinds: kinds, error: null});
    })
})

const projectId = 'ihientodatacollection';

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
});

// The kind for the new entity
const kind = 'HLC';
// The name/ID for the new entity
const name = 'sampletask1';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind]);

app.get('/HLC', (req, res) => {
    console.log(req.body)
    res.status(200).send('Hello, world!').end();
});

app.get('/test', (req, res) => {
    console.log(req.body)
    res.status(200).send('Hello, world!').end();
});

app.post('/HLC', function (req, res) {
    let values = []

    for (let iEntry = 0; iEntry < req.body.length; iEntry++)
    {
        let thisEntry = {
            key:datastore.key([kind]),
            data:req.body[iEntry]
        }
        values.push(thisEntry)
    }
    datastore
        .upsert(values)
        .then(() => {
            console.log("Saved");
            res.status(200).send('Saved').end()
        })
        .catch(err => {
            console.error('ERROR:', err);
            res.status(200).send('Error').end()
        });

});

app.get("/selectKind", (req, res) => {
    console.log("hit")
    const query = datastore
        .createQuery(req.query.formType)
        .select(["PROJECT_CODE"])
    var callBack = genCallback(req.query.formType, res)
    datastore.runQuery(query).then(callBack).catch(function (error) {
        console.log(error)

    });
})

function genCallback(formType, res) {
    var callback = (function (results, req) {
      // Task entities found.
        console.log(formType)
        var selected = formType
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        var projectCodes = results[0].map(a => a.PROJECT_CODE);
        var unique = projectCodes.filter( onlyUnique );
        console.log('Tasks:');
        unique.forEach(uniqueProj => console.log(uniqueProj));
        res.render('selectedFormType', {formType: selected, projectCodes: unique});
    })
    return callback
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
const Fields = {HLC: ["PROJECT_CODE","CLUSTER_NUMBER","HOUSE_NUMBER","VILLAGE","DATE","VOLUNTEER_NUMBER","IN_OR_OUT","HOUR","GAMBIAE","FUNESTUS","COUSTANI","MANSONIA","AEDES","COQUILETTIDIA","OTHER"]}

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
//        json2csv({ data: resultsData, fields: Fields[formType]},
//            function(err, csv) {
//                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
//                res.set('Content-Type', 'text/csv');
//                res.status(200).send(csv)})}
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
