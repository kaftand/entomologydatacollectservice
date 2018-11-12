module.exports = function(stringArray) {
    var fixedStringArray = []
    for(let iString = 0; iString < stringArray.length; iString++ ) {
        var thisJson = stringArray[iString]
        thisJson.PROJECT_CODE = thisJson.PROJECT_CODE.replace(" ", "").toUpperCase()
        fixedStringArray.push(thisJson)
    }

    return fixedStringArray
}
