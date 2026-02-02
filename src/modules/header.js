const setHeader = function(obj) {
    const [columnIndex, value] = obj.args;

    const columnPath = `spreadsheet.worksheets.${obj.worksheetIndex}.columns.${columnIndex}`;

    const savedColumns = obj.document.spreadsheet.worksheets[obj.worksheetIndex].columns;

    const set = {};

    if (savedColumns[columnIndex]) {
        set[`${columnPath}.title`] = value;
    } else {
        set[columnPath] = {
            title: value,
        };
    }

    return {
        $set: set,
    };
}

module.exports = {
    setHeader,
}
