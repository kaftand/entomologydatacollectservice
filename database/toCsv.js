function toCsv(headers, data) {
    str = ""
    for (var iRow = 0; iRow < data.length; iRow++) {
        for(var iHeader = 0; iHeader < headers.length; iHeader++)
        {
            if (str.length == 0) {

            } else {
                str = str + ","+ data[iRow][headers[iHeader]]
            }
        }
        str = str + "\n"
    }
}

module.exports = toCsv
