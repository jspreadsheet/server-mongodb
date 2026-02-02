const setMeta = function(obj) {
    let metaObject = obj.args[0];

    let changes = { $set: {} };

    Object.keys(metaObject).forEach(key => {
        changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.meta.${key}`] = metaObject[key];
    });

    return changes;
}

const resetMeta = function(obj) {
    let cellNames = obj.args[0];

    let changes = { $unset: {} };

    if (cellNames) {
        cellNames.forEach((cellName) => {
            changes.$unset[`spreadsheet.worksheets.${obj.worksheetIndex}.meta.${cellName}`] = '';
        });
    } else {
        changes.$unset[`spreadsheet.worksheets.${obj.worksheetIndex}.meta`] = '';
    }

    return changes;
}

module.exports = {
    setMeta,
    resetMeta,
}
