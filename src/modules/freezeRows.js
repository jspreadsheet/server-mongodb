const setFreezeRows = function(obj) {
    let rows = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.freezeRows`] = rows;

    return changes;
}

module.exports = {
    setFreezeRows,
}
