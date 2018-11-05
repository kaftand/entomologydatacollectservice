module.exports = function(stringArray) {
    var fixedStringArray = []
    for(let iString = 0; iString < stringArray.length; iString++ ) {
        var thisJson = JSON.parse(stringArray[iString])
        thisJson.PROJECT_CODE = thisJson.PROJECT_CODE.replace(" ", "").toUpperCase()
        fixedStringArray.push(JSON.stringify(thisJson))
    }

    return fixedStringArray
}
