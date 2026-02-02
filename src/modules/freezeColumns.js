const setFreezeColumns = function(obj) {
    let columns = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.freezeColumns`] = columns;

    return changes;
}

module.exports = {
    setFreezeColumns,
}
