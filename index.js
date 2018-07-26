

'use strict';

// [START app]
const express = require('express');
var bodyParser = require('body-parser')
const Datastore = require('@google-cloud/datastore');

var app = express()
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({ extended: false }))

const projectId = 'entodatacollectionihi';

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
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
    console.log(values)

});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END app]
