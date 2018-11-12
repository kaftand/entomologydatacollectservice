module.exports = function(stringArray) {
    var fixedStringArray = []
    var UPLOAD_TIMESTAMP = new Date().toISOString()
    for(let iString = 0; iString < stringArray.length; iString++ ) {
        var thisJson = stringArray[iString]
        thisJson.UPLOAD_TIMESTAMP = UPLOAD_TIMESTAMP
        fixedStringArray.push(thisJson)
    }

    return fixedStringArray
}
