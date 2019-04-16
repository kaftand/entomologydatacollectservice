const dbInterface = require("./DatabaseInterface")
const implementjs = require('implement-js')
const implement = implementjs.default
const { Interface, type } = implementjs
const Datastore = require('@google-cloud/datastore');
const Fields = require('./formCols')
const projectId = 'ihientodatacollection';
const stringify = require('csv-stringify/lib/sync')
const normalizeProjectCode = require('../utilities/normalizeProjectCode')
const insertTimeStamp = require('../utilities/insertTimeStamp')


const datastore = new Datastore({
  projectId: projectId,
});


const GoogleCloudConn = {

    postHLCData: function(resCallBack, errCallBack, req) {
        let values = []
        const kind = req.body.metaData.formType;
        var dataArray = normalizeProjectCode(req.body.dataArray)
        var dataArray = insertTimeStamp(dataArray)
        for (let iEntry = 0; iEntry < dataArray.length; iEntry++)
        {
            let thisEntry = {
                key:datastore.key([kind]),
                data:dataArray[iEntry]
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
                console.log("ERROR")
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
        var dataArray = normalizeProjectCode(req.body.dataArray)
        for (let iEntry = 0; iEntry < dataArray; iEntry++)
        {
            let thisEntry = {
                key:datastore.key([kind]),
                data:dataArray[iEntry]
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
    },

    downloadCSV: function (req, res) {
        const query = datastore
            .createQuery(req.query.formType)
            .filter('PROJECT_CODE', '=', req.query.projectCode);
        var callBack = this.getCSVCallBack(req.query.formType, res)
        datastore.runQuery(query).then(callBack).catch(function(error) {
            console.log(error)
        });
    },

    getCSVCallBack: function (formType, res)
    {
        var callBack = results => {
          // Task entities found.
            const thisformType = formType
            var resultsData = this.formatterFunctions[formType](results[0])
            var theseFields = (Fields[formType])
            const opts = {header:true};
            try {
                const csv = stringify(resultsData, opts);
                res.setHeader('Content-disposition', 'attachment; filename=' + formType + '.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);
            } catch (err) {
              console.error(err);
            }
        }
        return callBack

    },

    getRawData: function(formType, serial, res) {
        const query = datastore
            .createQuery(formType)
            .filter('serial', '=', parseInt(serial));
        var callBack = results => {
            try {
                res.set('Content-Type', 'application/json');
                res.status(200).send(results[0]);
            } catch (err) {
                console.error(err);
            }
        }
        datastore.runQuery(query).then(callBack).catch(function(error) {
            console.log(error)
        });
    },


    formatterFunctions: {
        wierdDateGreaterThan: function(ds1, ds2) {
            const yearParse = function(datestring) {
                return parseInt(datestring.substr(6,4))
            }
            const monthParse = function(datestring) {
                return parseInt(datestring.substr(3,2))
            }
            const dayParse = function(datestring) {
                return parseInt(datestring.substr(0,2))
            }
            if (yearParse(ds1) > yearParse(ds2)) {
                return true
            } else if (yearParse(ds1) < yearParse(ds2)) {
                return false
            } else if (monthParse(ds1) >  monthParse(ds2)) {
                return true
            } else if (monthParse(ds1) <  monthParse(ds2)) {
                return false
            } else if (dayParse(ds1) > dayParse(ds2)) {
                return true
            } else {
                return false
            }
        },
        sortSerialFormRow: function (arr) {
            const sortingFun = function (objA, objB) {
                if (this.wierdDateGreaterThan(objA.DATE, objB.DATE)) {
                    return 1
                } else if (this.wierdDateGreaterThan(objB.DATE, objA.DATE)) {
                    return -1
                } else if (objA.serial > objB.serial) {
                    return 1
                } else if (objA.serial < objB.serial) {
                    return -1
                } else if (objA.formEntryRow > objB.formEntryRow) {
                    return 1
                } else {
                    return -1
                }
            }.bind(this)
            return arr.sort(sortingFun)
        },

        filterMadeAfter2018: function (arr) {
            const parseYear = function (datestring) {
                return parseInt(datestring.substr(0,4))
            }
            var filteredArray = []
            for (var i = 0; i < arr.length; i++) {
                if (parseYear(arr[i].UPLOAD_TIMESTAMP) > 2018) {
                    filteredArray.push(arr[i])
                }
            }
            return filteredArray
        },

        "ConeBioassay": function (arr) {
            arr = this.filterMadeAfter2018(arr)
            var sortedArray = this.sortSerialFormRow(arr)
            var renamedArray = []
            console.log("hit")
            for (var iRow = 0; iRow < sortedArray.length; iRow++) {
                renamedArray.push({
                    "Study serial":sortedArray[iRow].serial,
                    "Name of person performing bioassays":sortedArray[iRow].EXPOSURE_PERFORMED_BY,
                    "date of test dd/mm/yyyy":sortedArray[iRow].DATE,
                    "Cluster Number":sortedArray[iRow].CLUSTER_NUMBER,
                    "House number":sortedArray[iRow].HOUSE_NUMBER,
                    "IRS Code":sortedArray[iRow].IRS_CODE,
                    "Temperature":sortedArray[iRow].TEMPERATURE,
                    "Humidity":sortedArray[iRow].HUMIDITY,
                    "mosquito sp.":sortedArray[iRow].MOSQUITO_STRAIN,
                    "age of mosq.":sortedArray[iRow].MOSQUITO_AGE_MIN.toString() + " to " + sortedArray[iRow].MOSQUITO_AGE_MAX.toString() + " days",
                    "cone":sortedArray[iRow].REPLICATE,
                    "test start":sortedArray[iRow].EXPOSURE_START,
                    "test end":sortedArray[iRow].EXPOSURE_END,
                    "mosq. exposed":sortedArray[iRow].N_EXPOSED,
                    "KD60A":sortedArray[iRow].A1,
                    "KD60D":sortedArray[iRow].M1,
                    "a24":sortedArray[iRow].A24,
                    "d24":sortedArray[iRow].M24,
                    "a48":sortedArray[iRow].A48,
                    "d48":sortedArray[iRow].M48,
                    "a72":sortedArray[iRow].A72,
                    "d72":sortedArray[iRow].M72,
                    "a96":sortedArray[iRow].A96,
                    "d96":sortedArray[iRow].M96,
                    "a120":sortedArray[iRow].A120,
                    "d120":sortedArray[iRow].M120,
                    "KD60J":sortedArray[iRow].KD60_TEMP,
                    "KD60H":sortedArray[iRow].KD60_HUMIDITY,
                    "24J":sortedArray[iRow].M24_TEMP,
                    "24H":sortedArray[iRow].M24_HUMIDITY,
                    "48J":sortedArray[iRow].M48_TEMP,
                    "48H":sortedArray[iRow].M48_HUMIDITY,
                    "72J":sortedArray[iRow].M72_TEMP,
                    "72H":sortedArray[iRow].M72_HUMIDITY,
                    "96J":sortedArray[iRow].M96_TEMP,
                    "96H":sortedArray[iRow].M96_HUMIDITY,
                    "120J":sortedArray[iRow].M120_TEMP,
                    "120H":sortedArray[iRow].M120_HUMIDITY
                })
            }
            return renamedArray
        },
        "IndoorRestingCollection": function (arr) {
            arr = this.filterMadeAfter2018(arr)
            arr = this.sortSerialFormRow(arr)
            const speciesStrings = ["CULEX","FUNESTUS","ARABIENSIS"]
            const fedUnfed = function(swahili) {
                if (swahili.includes("amekula")) {
                    return "fed"
                } else if (swahili.includes("hajala")) {
                    return "unfed"
                } else {
                    return ""
                }
            }

            var renamedArray = []
            for (var iRow = 0; iRow < arr.length; iRow++) {
                for (var iSpecies = 0; iSpecies < speciesStrings.length; iSpecies++) {
                    renamedArray.push({
                        "Cluster":arr[iRow].CLUSTER_NUMBER,
                        "Project Code":arr[iRow].PROJECT_CODE,
                        "Serial":arr[iRow].serial,
                        "Miezi":arr[iRow].MONTH,
                        "Weeki":arr[iRow].WEEK,
                        "Tarehe":arr[iRow].DATE,
                        "Form Row":arr[iRow].formEntryRow,
                        "House Number":arr[iRow].HUT_NUMBER,
                        "Feeding":fedUnfed(arr[iRow].TRAP_ID),
                        "species":speciesStrings[iSpecies],
                        "Wazima":arr[iRow][speciesStrings[iSpecies] + "_ALIVE"],
                        "Amekufa":arr[iRow][speciesStrings[iSpecies] + "_DEAD"],
                        "dead24":arr[iRow][speciesStrings[iSpecies] + "_M24"],
                        "dead48":arr[iRow][speciesStrings[iSpecies] + "_M48"],
                        "dead72":arr[iRow][speciesStrings[iSpecies] + "_M72"],
                        "dead96":arr[iRow][speciesStrings[iSpecies] + "_M96"],
                        "dead120":arr[iRow][speciesStrings[iSpecies] + "_M120"]
                    })
                }
            }

            return renamedArray
        },
        "HLC": function (arr) {
            arr = this.filterMadeAfter2018(arr)
            arr = this.sortSerialFormRow(arr)
            var renamedArray = []
            for (var iRow = 0; iRow < arr.length; iRow++) {
                renamedArray.push({
                    "Project Code":arr[iRow].PROJECT_CODE,
                    "VILLAGE":arr[iRow].VILLAGE,
                    "serial":arr[iRow].serial,
                    "form row":arr[iRow].formEntryRow,
                    "TIME":arr[iRow].HOUR,
                    "DATE":arr[iRow].DATE,
                    "HOUSE NO":arr[iRow].HOUSE_NUMBER,
                    "LOCATION (IN/OUT)":arr[iRow].IN_OR_OUT,
                    "COLLECTOR":arr[iRow].VOLUNTEER,
                    "An gambiae":arr[iRow].GAMBIAE,
                    "An funestus":arr[iRow].FUNESTUS,
                    "An coustani":arr[iRow].COUSTANI,
                    "culex":arr[iRow].CULEX,
                    "mansonia":arr[iRow].MANSONIA,
                    "aedes":arr[iRow].AEDES,
                    "coquiletidia":arr[iRow].COQUILETTIDIA,
                    "other":arr[iRow].other
                })
            }
            return renamedArray
        },
        "CDC_HDT": function (arr) {
            arr = this.filterMadeAfter2018(arr)
            arr = this.sortSerialFormRow(arr)
            var renamedArray = []
            const speciesStrings = ["CULEX","FUNESTUS","ARABIENSIS"]
            for (var iRow = 0; iRow < arr.length; iRow++) {
                for (var iSpecies = 0; iSpecies < speciesStrings.length; iSpecies++) {
                    renamedArray.push({
                        "Cluster":arr[iRow].CLUSTER_NUMBER,
                        "Project Code":arr[iRow].PROJECT_CODE,
                        "Serial":arr[iRow].serial,
                        "Miezi":arr[iRow].MONTH,
                        "Weeki":arr[iRow].WEEK,
                        "Tarehe":arr[iRow].DATE,
                        "Form Row":arr[iRow].formEntryRow,
                        "House Number":arr[iRow].HUT_NUMBER,
                        "Trap_ID":arr[iRow].TRAP_ID,
                        "species":speciesStrings[iSpecies],
                        "hajalawazima":arr[iRow][speciesStrings[iSpecies] + "_UNFED_ALIVE"],
                        "amekulawazima":arr[iRow][speciesStrings[iSpecies] + "_FED_ALIVE"],
                        "hajalaamekufa":arr[iRow][speciesStrings[iSpecies] + "_UNFED_DEAD"],
                        "amekulaamekufa":arr[iRow][speciesStrings[iSpecies] + "_FED_DEAD"]
                    })
                }
            }
            return renamedArray
        }
    }
}
module.exports = implement(dbInterface)(GoogleCloudConn)
//export default implement(dbInterface)(GoogleCloudConn)
