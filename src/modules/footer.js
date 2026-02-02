const setFooter = function(obj) {
    let matrix = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.footers`] = matrix;

    return changes;
}

const setFooterValue = function(obj) {
    const [x, y, value] = obj.args;

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.footers.${y}.${x}`] = value;

    return changes;
}

const resetFooter = function(obj) {
    let changes = { $unset: {} };

    changes.$unset[`spreadsheet.worksheets.${obj.worksheetIndex}.footers`] = '';

    return changes;
}

module.exports = {
    setFooter,
    setFooterValue,
    resetFooter,
}
