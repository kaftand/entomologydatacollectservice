const dbInterface = require("./DatabaseInterface")
const implementjs = require('implement-js')
const implement = implementjs.default
const { Interface, type } = implementjs
const Datastore = require('@google-cloud/datastore');
const projectId = 'ihientodatacollection';
const datastore = new Datastore({
  projectId: projectId,
});


const GoogleCloudConn = {

    getHLCData: function(resCallBack) {

    },
    postHLCData: function(resCallBack, errCallBack, req) {
        let values = []
        const kind = 'HLC';
        for (let iEntry = 0; iEntry < req.body.dataArray.length; iEntry++)
        {
            let thisEntry = {
                key:datastore.key([kind]),
                data:req.body.dataArray[iEntry]
            }
            values.push(thisEntry)
        }
        datastore
            .upsert(values)
            .then(() => {
                resCallBack()

            })
            .catch(err => {
                errCallBack()
                res.status(200).send('Error').end()
            });
    },
    getHLCCols: function(resCallBack, errCallBack, req) {
        let values = []
        const kind = 'HLC';
        for (let iEntry = 0; iEntry < req.body.dataArray.length; iEntry++)
        {
            let thisEntry = {
                key:datastore.key([kind]),
                data:req.body.dataArray[iEntry]
            }
            values.push(thisEntry)
        }
        datastore
            .upsert(values)
            .then(() => {
                resCallBack()

            })
            .catch(err => {
                errCallBack()
                res.status(200).send('Error').end()
            });
    },

    postHutStudyData: function() {
        let values = []
        const kind = 'HutStudy';
        for (let iEntry = 0; iEntry < req.body.dataArray.length; iEntry++)
        {
            let thisEntry = {
                key:datastore.key([kind]),
                data:req.body.dataArray[iEntry]
            }
            values.push(thisEntry)
        }
        datastore
            .upsert(values)
            .then(() => {
                resCallBack()

            })
            .catch(err => {
                errCallBack()
                res.status(200).send('Error').end()
            });
    },

    getProjectCodes:function(resCallBack, tableName) {
        const query = datastore
            .createQuery(tableName)
            .select(["PROJECT_CODE"])
        var callBack = this.genProjectCodeCallback(tableName, resCallBack)
        datastore.runQuery(query).then(callBack).catch(function (error) {
            console.log(error)
        });
    },

    genProjectCodeCallback: function (formType, resCallBack) {
        var callback = (function (results, req) {
          // Task entities found.
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
            var projectCodes = results[0].map(a => a.PROJECT_CODE);
            var unique = projectCodes.filter( onlyUnique );
            resCallBack(formType, unique);
        })
        return callback
    },
    getTableNames: function(resCallBack) {
        const query = datastore.createQuery('__kind__').select('__key__');

        datastore.runQuery(query).then(results => {
            const entities = results[0];
            const kinds = entities.map(entity => entity[datastore.KEY].name);
            var kinds2keep = [];
            for (var iKind = 0; iKind < kinds.length; iKind++)
            {
                if (!kinds[iKind].endsWith("__"))
                {
                    kinds2keep.push(kinds[iKind])
                }
            }
            console.log('Kinds:');
            kinds.forEach(kind => console.log(kind));
            resCallBack(kinds2keep)
        })
    }
}
module.exports = implement(dbInterface)(GoogleCloudConn)
//export default implement(dbInterface)(GoogleCloudConn)
