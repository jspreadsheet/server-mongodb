const setStyle = function(obj) {
    const set = {
        [`spreadsheet.style`]: obj.instance.config.style,
        [`spreadsheet.worksheets.${obj.worksheetIndex}.style`]: obj.instance.worksheets[obj.worksheetIndex].getStyle(null, true),
    };

    return {
        $set: set,
    };
}

const resetStyle = function(obj) {
    const set = {
        [`spreadsheet.worksheets.${obj.worksheetIndex}.style`]: obj.instance.worksheets[obj.worksheetIndex].getStyle(null, true),
    };

    return {
        $set: set,
    };
}

module.exports = {
    setStyle,
    resetStyle
}
